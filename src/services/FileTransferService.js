import http from "../http-common";

class FileTransferService {
  upload(file, id, onUploadProgress) {
    let formData = new FormData();

    formData.append("image", file);
    formData.append("id", id);

    return http.post("/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress
    });
  }

  download(id) {
    return http.get(`/image/${id}`);
  }
}

export default new FileTransferService();
