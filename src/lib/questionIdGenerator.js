// utils/questionIdGenerator.js

class QuestionIdGenerator {
  constructor() {
    this.generatedIds = new Set()
    this.questionHashes = new Map()
    this.loadFromStorage()
  }

  // Generate a unique hash for a question using Web Crypto API
  async generateQuestionHash(questionText) {
    if (!questionText || typeof questionText !== 'string') return Math.random().toString(36);
    // Create a normalized version of the question supporting all Unicode scripts (Kannada, Hindi, etc.)
    const normalizedQuestion = questionText
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\p{L}\p{N}\s]/gu, '') || questionText.trim();
    
    // Use Web Crypto API to generate SHA-256 hash
    const encoder = new TextEncoder()
    const data = encoder.encode(normalizedQuestion)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    return hashHex
  }

  // Generate a unique ID for a question
  async generateUniqueId(questionText) {
    const timestamp = Date.now()
    const randomBytes = this.generateRandomBytes(16)
    const questionHash = await this.generateQuestionHash(questionText)
    
    // Combine timestamp, random bytes, and question hash for uniqueness
    const uniqueId = `${timestamp}-${randomBytes}-${questionHash.substring(0, 16)}`
    
    return uniqueId
  }

  // Generate random bytes using Web Crypto API
  generateRandomBytes(length) {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Check if question is duplicate
  async isQuestionDuplicate(questionText) {
    const questionHash = await this.generateQuestionHash(questionText)
    
    // Check if we've seen this exact hash before in current session
    if (this.questionHashes.has(questionHash)) {
      return true
    }
    
    // Check for nearly identical questions (95% similarity threshold instead of 85% to allow similar quiz formats)
    for (let [existingHash, existingText] of this.questionHashes) {
      if (existingText === questionText) return true;
      const similarity = this.calculateSimilarity(questionText, existingText)
      if (similarity > 0.95) {
        return true
      }
    }
    
    return false
  }

  // Calculate similarity between two strings
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const costs = new Array()
    for (let i = 0; i <= longer.length; i++) {
      let lastValue = i
      for (let j = 0; j <= shorter.length; j++) {
        if (i === 0) {
          costs[j] = j
        } else if (j > 0) {
          let newValue = costs[j - 1]
          if (longer.charAt(i - 1).toLowerCase() !== shorter.charAt(j - 1).toLowerCase()) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
          }
          costs[j - 1] = lastValue
          lastValue = newValue
        }
      }
      if (i > 0) costs[shorter.length] = lastValue
    }
    const distance = costs[shorter.length]
    return (longer.length - distance) / longer.length
  }

  // Add question to storage
  async addQuestion(questionText, questionId) {
    const questionHash = await this.generateQuestionHash(questionText)
    this.generatedIds.add(questionId)
    this.questionHashes.set(questionHash, questionText)
    this.saveToStorage()
  }

  // Save to localStorage with encryption
  saveToStorage() {
    if (typeof window !== 'undefined') {
      const data = {
        ids: Array.from(this.generatedIds),
        hashes: Array.from(this.questionHashes.entries())
      }
      const encryptedData = this.encryptData(JSON.stringify(data))
      localStorage.setItem('secure_question_store', encryptedData)
    }
  }

  // Load from localStorage
  loadFromStorage() {
    if (typeof window !== 'undefined') {
      const encryptedData = localStorage.getItem('secure_question_store')
      if (encryptedData) {
        try {
          const decryptedData = this.decryptData(encryptedData)
          const data = JSON.parse(decryptedData)
          this.generatedIds = new Set(data.ids || [])
          this.questionHashes = new Map(data.hashes || [])
        } catch (error) {
          console.error('Failed to load question store:', error)
          this.generatedIds = new Set()
          this.questionHashes = new Map()
        }
      }
    }
  }

  // Simple encryption for localStorage
  encryptData(data) {
    return btoa(encodeURIComponent(data))
  }

  decryptData(encryptedData) {
    return decodeURIComponent(atob(encryptedData))
  }

  // Clear all stored questions
  clearStore() {
    this.generatedIds.clear()
    this.questionHashes.clear()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('secure_question_store')
    }
  }

  // Get statistics
  getStats() {
    return {
      totalQuestions: this.generatedIds.size,
      uniqueHashes: this.questionHashes.size,
      timestamp: new Date().toISOString()
    }
  }
}

// Create a singleton instance
const questionIdGenerator = new QuestionIdGenerator()

export default questionIdGenerator