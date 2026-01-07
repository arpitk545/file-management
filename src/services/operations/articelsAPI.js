import { apiConnector } from "../apiconnector";
import { createRegionAPI,getAllRegionsAPI, createArticleAPI,getAllArticlesAPI,deleteArticleAPI,deleteArticleByTitleAPI,
getArticleByIdAPI,updateArticleStatusAPI,updateRegionAPI,deleteRegionAPI,updateArticleAPI } from "../apis";

export const createRegionWithStructure =async (formData) =>{
    try {
        const response = await apiConnector("POST", createRegionAPI, formData, {
            "Content-Type": "application/json"
        });
        return response.data;
    } catch (error) {
        console.error("Error in create region API:", error);
        throw error;
    }
}

//get all regions with structure
export const getAllRegionsWithStructure = async () => {
    try {
        const response = await apiConnector("GET", getAllRegionsAPI);
        return response.data;
    } catch (error) {
        console.error("Error in fetching all regions API:", error);
        throw error;
    }
}
//update region by name
export const updateRegionByName = async (name, formData) => {
    try {
        const response = await apiConnector("PATCH", updateRegionAPI(name), formData, {
            "Content-Type": "application/json"
        });
        return response.data;
    } catch (error) {
        console.error("Error in updating region API:", error);
        throw error;
    }
};

//delete region by name
export const deleteRegionByName = async (name) => {
    try {
        const response = await apiConnector("DELETE", deleteRegionAPI(name));
        return response.data;
    } catch (error) {
        console.error("Error in deleting region API:", error);
        throw error;
    }
};

//create article
export const createArticle = async (formData) => {
    try {
        const response = await apiConnector("POST", createArticleAPI, formData, {
             "Content-Type": "multipart/form-data"
        });
        return response.data;
    } catch (error) {
        console.error("Error in create article API:", error);
        throw error;
    }
}

//get all articles
export const getAllArticles = async () => {
    try {
        const response = await apiConnector("GET", getAllArticlesAPI);
        return response.data;
    } catch (error) {
        console.error("Error in fetching all articles API:", error);
        throw error;
    }
}

//get articles by id
export const getArticleById = async (id) => {
    try {
        const response = await apiConnector("GET", getArticleByIdAPI(id));
        return response.data;
    } catch (error) {
        console.error("Error in fetching article by ID API:", error);
        throw error;
    }
};

//approve article
export const updateArticleStatus = async (id, status) => {
    try {
        const response = await apiConnector("PATCH", updateArticleStatusAPI(id), { status });
        return response.data;
    } catch (error) {
        console.error("Error in updating article status API:", error);
        throw error;
    }
}

//update article
export const updateArticle = async (id, formData) => {
    try {
        const response = await apiConnector("PATCH", updateArticleAPI(id), formData, {
            "Content-Type": "multipart/form-data"
        });
        return response.data;
    } catch (error) {
        console.error("Error in updating article API:", error);
        throw error;
    }
}

//delete article 
export const deleteArticle = async (id) => {
    try {
        const response = await apiConnector("DELETE", deleteArticleAPI(id));
        return response.data;
    } catch (error) {
        console.error("Error in deleting article API:", error);
        throw error;
    }
};

//delete article by title
export const deleteArticleByTitle = async (title) => {
    try {
        const response = await apiConnector("DELETE", deleteArticleByTitleAPI(title));
        return response.data;
    } catch (error) {
        console.error("Error in deleting article by title API:", error);
        throw error;
    }
}