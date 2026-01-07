"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "../../../ui/button"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { getallContestResult } from "../../../../services/operations/contestAPI" 

export default function ShowALLResult() {
  const { id } = useParams() 
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      try {
        const response = await getallContestResult(id)
        if (response?.success && Array.isArray(response.data)) {
          setResults(response.data)
        } else {
          toast.error("Failed to fetch contest results or no results found.")
          setResults([])
        }
      } catch (error) {
        console.error("Error fetching contest results:", error)
        toast.error("Error loading contest results.")
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchResults()
    } else {
      setLoading(false)
      toast.error("No contest ID provided.")
    }
  }, [id])

  const handleBack = () => {
    navigate("/filter-contest")
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-white to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading contest results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-white to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-6">Contest Results</h1>

        {results.length === 0 ? (
          <div className="text-center text-gray-500 py-8 md:py-12">
            <p className="text-base md:text-lg font-medium">No results found for this contest.</p>
            <Button onClick={handleBack} className="mt-4 md:mt-6 bg-blue-500 hover:bg-blue-600 text-white">
              Go Back
            </Button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-2 text-left rounded-tl-lg">Image</th>
                    <th className="py-3 px-2 text-left">Name</th>
                    <th className="py-3 px-2 text-left">Email</th>
                    <th className="py-3 px-2 text-left">Score</th>
                    <th className="py-3 px-2 text-left">Total Questions</th>
                    <th className="py-3 px-2 text-left rounded-tr-lg">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-sm font-light">
                  {results.map((result, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-2 text-left whitespace-nowrap">
                        <img
                          src={result.image || "/placeholder.svg?height=40&width=40&query=user+avatar"}
                          alt={result.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="py-3 px-2 text-left font-medium">{result.name}</td>
                      <td className="py-3 px-2 text-left break-all">{result.email}</td>
                      <td className="py-3 px-2 text-left">{result.score}</td>
                      <td className="py-3 px-2 text-left">{result.totalQuestions}</td>
                      <td className="py-3 px-2 text-left">{new Date(result.submittedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {results.map((result, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                  <div className="flex items-center space-x-4 mb-3">
                    <img
                      src={result.image || "/placeholder.svg?height=40&width=40&query=user+avatar"}
                      alt={result.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">{result.name}</h3>
                      <p className="text-sm text-gray-500 break-all">{result.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Score</p>
                      <p className="font-medium">{result.score}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Questions</p>
                      <p className="font-medium">{result.totalQuestions}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">Submitted At</p>
                      <p className="font-medium">{new Date(result.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}