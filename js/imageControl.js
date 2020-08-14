var ImageControl = new function () {

    var debug = true;

    var defaultCheckList = {
        'maxWidth': 1000, // 가로 해상도 최대사이즈
        'typeCheck': true, // 확장자 검사
    };

    /**
     * @param event
     * @param checkOptions
     * @param callBack
     */
    this.imageHandle = function (event, checkOptions, callBack) {
        var files = event.target.files;
        var filesArr = Array.prototype.slice.call(files);
        var fileName = '';

        var checkList = $.extend({}, defaultCheckList, checkOptions);

        filesArr.forEach(function (f) {
            fileName = f.name;
            var errorMsg = '';

            if (checkList.typeCheck && !f.type.match("image.*")) {
                errorMsg = '확장자는 이미지 확장자만 가능합니다.';
                if (debug) {
                    console.log('[fileTypeError] fileType : ' + f.type);
                }
            }

            if (errorMsg) {
                alert(errorMsg);
                return false;
            }

            var reader = new FileReader();
            reader.onload = function (event) {
                var tmpImg = new Image();
                tmpImg.src = event.target.result;

                tmpImg.onload = function () {
                    var image = ImageControl.imageReSize(this, checkList);
                    if (image) {
                        if (debug) {
                            console.log('callBack Data');
                            console.log(image);
                            console.log(fileName);
                        }
                        callBack(image, fileName);
                    }
                };
            };
            reader.readAsDataURL(f);
        });
    };


    /**
     * @param img
     * @param option
     * @returns string
     */
    this.imageReSize = function (img, option) {
        var canvas = document.createElement('canvas');
        var canvasContext = canvas.getContext('2d');
        var size = ImageControl.resizeImageSize(img.width, img.height, option.maxWidth);
        var dataURI = img.src;

        // 이미지 정렬
        EXIF.getData(img, function () {
            var tag = EXIF.getAllTags(img);

            if (tag.Orientation === 1 || tag.Orientation === 3 || !tag.Orientation) {
                canvas.width = size[0];
                canvas.height = size[1];
            } else {
                canvas.height = size[0];
                canvas.width = size[1];
            }

            if (tag.Orientation === 1 || !tag.Orientation) {
                canvasContext.drawImage(img, 0, 0, canvas.width, canvas.height);
            } else if (tag.Orientation === 3) {
                canvasContext.transform(-1, 0, 0, -1, canvas.width, canvas.height);
                canvasContext.drawImage(img, 0, 0, canvas.width, canvas.height);
            } else if (tag.Orientation === 6) {
                canvasContext.transform(0, 1, -1, 0, canvas.width, 0);
                canvasContext.drawImage(img, 0, 0, canvas.height, canvas.width);
            } else {
                canvasContext.transform(0, -1, 1, 0, 0, canvas.height);
                canvasContext.drawImage(img, 0, 0, canvas.height, canvas.width);
            }
        });

        canvasContext.drawImage(img, 0, 0, canvas.width, canvas.height);

        if (dataURI.length > canvas.toDataURL("image/jpeg").length) {
            dataURI = canvas.toDataURL("image/jpeg");
        }

        return dataURI;
    };

    /**
     * @param imageW
     * @param imageH
     * @param maxW
     * @returns array image[w, h]
     */
    this.resizeImageSize = function (imageW, imageH, maxW) {
        var ratio_w = maxW / imageW;
        var w, h;

        if (imageW < maxW) {
            w = imageW;
            h = imageH;

        } else {
            w = imageW * ratio_w;
            h = imageH * ratio_w;
        }

        return [w, h];

    };
};
