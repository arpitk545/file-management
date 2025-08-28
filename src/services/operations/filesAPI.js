import { apiConnector } from "../apiconnector";
import{CreateFileRegionAPI,getAllFileRegionAPI,updateFileRegionAPI,deleteFileRegionAPI, getAllUserFileAPI,
  createFileAPI,getAllFileAPI,updateFileStatusAPI, getFileByIdAPI,updateFileAPI,deleteFileAPI,deleteFileByTitleAPI 
} from "../apis"

//create Region for the file

export const CreateFileRegion =async (formData)=>{
    try {
            const response = await apiConnector("POST", CreateFileRegionAPI, formData, {
                "Content-Type": "application/json"
            });
            return response.data;
        } catch (error) {
            console.error("Error in create region API:", error);
            throw error;
        }
}
//get all regions 
export const GetFileRegion = async () => {
    try {
        const response = await apiConnector("GET", getAllFileRegionAPI, null, {
        "Content-Type": "application/json"
        });
        return response.data;
        } catch (error) {
        console.error("Error in get region API:", error);
        throw error;
    }
 }

//Update Region by Name
export const UpdateFileRegion = async (name, updateData) => {
  try {
    const response = await apiConnector("PUT", updateFileRegionAPI(name), updateData, {
      "Content-Type": "application/json",
    });
    return response.data;
  } catch (error) {
    console.error("Error in update region API:", error);
    throw error;
  }
};

//Delete Region by Name
export const DeleteFileRegion = async (name) => {
  try {
    const response = await apiConnector("DELETE", deleteFileRegionAPI(name),{
      "Content-Type": "application/json",
    });
    return response.data;
  } catch (error) {
    console.error("Error in delete region API:", error);
    throw error;
  }
};

//create file
export const CreateFileNew = async (formData) => {
   try {
         const token = localStorage.getItem("token");
          const response = await apiConnector("POST", createFileAPI, formData, {
               "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${token}`,
          });
          return response.data;
      } catch (error) {
          console.error("Error in create File API:", error);
          throw error;
      }
  } 

//get all files 
export const getAllFiles = async () => {
    try {
        const response = await apiConnector("GET",getAllFileAPI);
        return response.data;
    } catch (error) {
        console.error("Error in fetching all File API:", error);
        throw error;
    }
}

//get user files this will show only to the user
export const getAllUserFiles = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiConnector("GET",getAllUserFileAPI, null, {
      "Authorization": `Bearer ${token}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error in fetching all File API:", error);
    throw error;
  }
};


//update File Status 
export const updateFileStatus = async (id, status) => {
    try {
        const response = await apiConnector("PATCH",updateFileStatusAPI(id), { status });
        return response.data;
    } catch (error) {
        console.error("Error in updating File status API:", error);
        throw error;
    }
}

//Get file By Id
export const getFileById = async (id) => {
    try {
        const response = await apiConnector("GET", getFileByIdAPI(id));
        return response.data;
    } catch (error) {
        console.error("Error in fetching File by ID API:", error);
        throw error;
    }
};

export const updateFile = async (id, formData) => {
    try {
        const response = await apiConnector("PATCH", updateFileAPI(id), formData, {
            "Content-Type": "multipart/form-data",
        });
        return response.data;
    } catch (error) {
        console.error("Error in updating File API:", error);
        throw error;
    }
}

//delete article 
export const deleteFile = async (id) => {
    try {
        const response = await apiConnector("DELETE",deleteFileAPI(id),{
        });
        return response.data;
    } catch (error) {
        console.error("Error in deleting File API:", error);
        throw error;
    }
};

//delete file by  title
export const deleteFileByTitle = async (fileTitle) => {
    try {
        const response = await apiConnector("DELETE",deleteFileByTitleAPI(fileTitle));
        return response.data;
    } catch (error) {
        console.error("Error in deleting article by title API:", error);
        throw error;
    }
}