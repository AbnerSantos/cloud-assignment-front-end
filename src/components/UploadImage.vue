<template>
  <div>
    <div class="row">
      <div class="col-8">
        <label class="btn btn-default p-0">
          <input
            type="file"
            accept="image/png"
            ref="file"
            @change="selectImage"
          />
        </label>
      </div>

      <div class="col-4">
        <button
          class="btn btn-success btn-sm float-right"
          :disabled="!currentImage"
          @click="upload"
        >
          Upload
        </button>
      </div>
    </div>

    <div v-if="currentImage" class="progress">
      <div
        class="progress-bar progress-bar-info"
        role="progressbar"
        :aria-valuenow="progress"
        aria-valuemin="0"
        aria-valuemax="100"
        :style="{ width: progress + '%' }"
      >
        {{ progress }}%
      </div>
    </div>

    <div v-if="previewImage">
      <div>
        <img class="preview my-3" :src="previewImage" alt="" />
      </div>
    </div>

    <div v-if="message" class="alert alert-secondary" role="alert">
      {{ message }}
    </div>

    <div class="col-4">
        <button
          class="btn btn-success btn-sm float-left"
          :disabled="!convertedPdf"
          @click="download"
        >
          Download
        </button>
      </div>
  </div>
</template>

<script>
import { randomUUID } from "crypto";
import { delay } from "q";
import FileTransferService from "../services/FileTransferService";

export default {
  name: "upload-image",
  data() {
    return {
      currentImage: undefined,
      previewImage: undefined,
      pdf: undefined,

      progress: 0,
      message: "",

      imageInfos: [],
    };
  },
  methods: {
    selectImage() {
      this.currentImage = this.$refs.file.files.item(0);
      this.previewImage = URL.createObjectURL(this.currentImage);
      this.pdf = null;
      this.progress = 0;
      this.message = "";
    },

    async upload() {
      this.progress = 0;
      var id = randomUUID;

      FileTransferService.upload(this.currentImage, id, (event) => {
        this.progress = Math.round((100 * event.loaded) / event.total);
      })
        .then(async (response) => {
          if (response.status != 200) throw new Error();
      
          this.message = response.data.message;

          var download = FileTransferService.download(id);
          while(download.status != 200) {
            await delay(2000);
            download = FileTransferService.download(id);
          }

          return response
        })
        .then((response) => {
          this.pdf = response.data
        })
        .catch((err) => {
          this.progress = 0;
          this.message = "Could not upload the image! " + err;
          this.currentImage = undefined;
        });
    },

    download() {
      var fileUrl = window.createObjectURL(new Blob([this.pdf.data]));
      var fileLink = document.createElement('a');
      fileLink.href = fileUrl;

      fileLink.setAttribute('download', 'converted.pdf');
      document.body.appendChild(fileLink);

      fileLink.click();
    }
  },
};
</script>

<style scoped>
.preview {
  max-width: 600px;
}
</style>
