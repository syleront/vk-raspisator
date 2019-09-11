const FileHandler = async (evt) => {
  let { files } = evt.clipboardData;

  Array.from(files).forEach(async (file) => {
    let filename = file.lastModified + "_" + file.name;
    Raspisator.addLoadState(filename);

    let form = new FormData();
    form.append("photo", file);

    let { upload_url } = await api.req("photos.getWallUploadServer");

    GM_xmlhttpRequest({
      method: "POST",
      url: upload_url,
      data: form,
      async onload(res) {
        let json = JSON.parse(res.responseText);
        let [photo] = await api.req("photos.saveWallPhoto", json);
        let max = Helpers.getPhotoMax(photo.sizes);

        Raspisator.removeLoadState(filename);
        Raspisator.addImage(max.url);
      }
    });
  });
};

Raspisator.input.addEventListener("paste", FileHandler);