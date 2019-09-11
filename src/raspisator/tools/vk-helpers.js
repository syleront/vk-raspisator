class Helpers {
  static _setCurHandlers(params = {}) {
    const { onMediaChoose, onMediaProgress, attachCount } = params;
    const { cur } = unsafeWindow;

    cur.chooseMedia = onMediaChoose;
    cur.chooseMedia.pbind = cur.chooseMedia.bind;
    cur.attachCount = attachCount;

    cur.showMediaProgress = onMediaProgress;
  }

  static _loadAudioPage() {
    const { stManager } = unsafeWindow;

    return new Promise((resolve) => {
      const { AudioPage } = unsafeWindow;
      if (typeof AudioPage !== "undefined") {
        console.log("page is defined");
        resolve(true);
      } else {
        console.log("page is undefined, loading...");

        stManager.add(["audio.js", "indexer.js", "auto_list.js", "grid_sorter.js", "audio.css"], function () {
          const { cur } = unsafeWindow;
          cur.audioAttachOriginalOwnerId = !1;
          cur.audioAttachSwitchOwnerId = !1;
          resolve(true);
        });
      }
    });
  }

  static getCurrentPhotoMax() {
    const { pvCurPhoto } = unsafeWindow.cur;
    return pvCurPhoto.w_src || pvCurPhoto.z_src || pvCurPhoto.y_src || pvCurPhoto.x_src || pvCurPhoto.m_src || pvCurPhoto.s_src;
  }

  static getPhotoMax(sizes) {
    let max = { height: 0, width: 0 };

    sizes.forEach((e) => {
      if (e.height > max.height || e.width > max.width) {
        max = e;
      }
    });

    return max;
  }

  static showPhotoAttachBox(params = {}) {
    const { limit } = params;
    const { showBox } = unsafeWindow;

    this._setCurHandlers(params);

    return showBox("al_photos.php", {
      act: "choose_photo",
      mail_add: "",
      max_files: limit || 10,
      no_album_select: 1,
      to_id: false
    });
  }

  static showVideoAttachBox(params = {}) {
    const { limit } = params;
    const { showBox } = unsafeWindow;

    this._setCurHandlers(params);

    return showBox("al_video.php", {
      act: "a_choose_video_box",
      mail_add: "",
      max_files: limit || 10,
      no_album_select: 1,
      to_id: false
    });
  }

  static showDocAttachBox(params = {}) {
    const { limit } = params;
    const { showBox } = unsafeWindow;

    this._setCurHandlers(params);

    return showBox("docs.php", {
      act: "a_choose_doc_box",
      mail_add: "",
      max_files: limit || 10,
      no_album_select: 1,
      to_id: false
    });
  }

  static async showAudioAttachBox(params = {}) {
    this._setCurHandlers(params);

    await this._loadAudioPage();

    const { AudioPage, AudioUtils, vk } = unsafeWindow;

    return AudioPage.showAttachBox(vk.id, {
      canPlaylistAttach: true,
      onAudioChoose: AudioUtils.onAudioChoose,
      onPlaylistChoose: AudioUtils.onPlaylistChoose
    });
  }

  static showDoneBox(string) {
    const { showDoneBox } = unsafeWindow;
    showDoneBox(string, { w: 420 });
  }

  static alertMaxFiles() {
    const { showDoneBox, cur } = unsafeWindow;
    showDoneBox((cur.chooseParams.maxFiles == 2 && 0) ? "Вы не можете прикрепить более 2 вложений к одному комментарию." : "Вы не можете прикрепить более 10 вложений к одной записи.", { w: 420 });
  }
}

export default Helpers;
