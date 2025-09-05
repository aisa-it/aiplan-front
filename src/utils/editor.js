export function enableImageResizeInDiv(el) {
  if (
    !(
      /chrome/i.test(navigator.userAgent) &&
      /google/i.test(window.navigator.vendor)
    )
  ) {
    return;
  }
  var editor = el; //document.getElementById(id);
  var resizing = false;
  var currentImage;
  var createDOM = function (elementType, className, styles) {
    let ele = document.createElement(elementType);
    ele.class = className ?? '';
    setStyle(ele, styles);
    return ele;
  };
  var setStyle = function (ele, styles) {
    for (let key in styles) {
      ele.style[key] = styles[key];
    }
    return ele;
  };
  // var removeResizeFrame = function () {
  //   !!document.querySelectorAll('.resize-frame,.resizer') &&
  //     document
  //       .querySelectorAll('.resize-frame,.resizer')
  //       .forEach((item) => item.parentNode.removeChild(item));
  // };
  var offset = function offset(el) {
    const rect = el.getBoundingClientRect(),
      scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
  };
  var clickImage = function (img) {
    // removeResizeFrame();
    currentImage = img;
    const imgHeight = img.offsetHeight;
    const imgWidth = img.offsetWidth;
    const imgPosition = { top: img.offsetTop, left: img.offsetLeft };
    const editorScrollTop = editor.scrollTop;
    const editorScrollLeft = editor.scrollLeft;
    const top = imgPosition.top - editorScrollTop - 1;
    const left = imgPosition.left - editorScrollLeft - 1;

    editor.append(
      createDOM('span', 'resize-frame', {
        margin: '10px',
        position: 'absolute',
        top: top + imgHeight - 10 + 'px',
        left: left + imgWidth - 10 + 'px',
        border: 'solid 3px blue',
        width: '6px',
        height: '6px',
        cursor: 'se-resize',
        zIndex: 1,
      }),
    );

    editor.append(
      createDOM('span', 'resizer top-border', {
        position: 'absolute',
        top: top + 'px',
        left: left + 'px',
        border: 'dashed 1px grey',
        width: imgWidth + 'px',
        height: '0px',
      }),
    );

    editor.append(
      createDOM('span', 'resizer left-border', {
        position: 'absolute',
        top: top + 'px',
        left: left + 'px',
        border: 'dashed 1px grey',
        width: '0px',
        height: imgHeight + 'px',
      }),
    );

    editor.append(
      createDOM('span', 'resizer right-border', {
        position: 'absolute',
        top: top + 'px',
        left: left + imgWidth + 'px',
        border: 'dashed 1px grey',
        width: '0px',
        height: imgHeight + 'px',
      }),
    );

    editor.append(
      createDOM('span', 'resizer bottom-border', {
        position: 'absolute',
        top: top + imgHeight + 'px',
        left: left + 'px',
        border: 'dashed 1px grey',
        width: imgWidth + 'px',
        height: '0px',
      }),
    );

    document.querySelector('.resize-frame').onmousedown = () => {
      resizing = true;
      return false;
    };

    editor.onmouseup = () => {
      if (resizing) {
        currentImage.style.width =
          document.querySelector('.top-border').offsetWidth + 'px';
        currentImage.style.height =
          document.querySelector('.left-border').offsetHeight + 'px';
        refresh();
        currentImage.click();
        resizing = false;
      }
    };

    editor.onmousemove = (e) => {
      if (currentImage && resizing) {
        let height = e.pageY - offset(currentImage).top;
        let width = e.pageX - offset(currentImage).left;
        height = height < 1 ? 1 : height;
        width = width < 1 ? 1 : width;
        const top = imgPosition.top - editorScrollTop - 1;
        const left = imgPosition.left - editorScrollLeft - 1;
        setStyle(document.querySelector('.resize-frame'), {
          top: top + height - 10 + 'px',
          left: left + width - 10 + 'px',
        });

        setStyle(document.querySelector('.top-border'), {
          width: width + 'px',
        });
        setStyle(document.querySelector('.left-border'), {
          height: height + 'px',
        });
        setStyle(document.querySelector('.right-border'), {
          left: left + width + 'px',
          height: height + 'px',
        });
        setStyle(document.querySelector('.bottom-border'), {
          top: top + height + 'px',
          width: width + 'px',
        });
      }
      return false;
    };
  };
  var bindClickListener = function () {
    editor.querySelectorAll('img').forEach((img) => {
      img.onclick = (e) => {
        if (e.target === img) {
          clickImage(img);
        }
      };
    });
  };
  var refresh = function () {
    bindClickListener();
    // removeResizeFrame();
    if (!currentImage) {
      return;
    }
    var img = currentImage;
    var imgHeight = img.offsetHeight;
    var imgWidth = img.offsetWidth;
    var imgPosition = { top: img.offsetTop, left: img.offsetLeft };
    var editorScrollTop = editor.scrollTop;
    var editorScrollLeft = editor.scrollLeft;
    const top = imgPosition.top - editorScrollTop - 1;
    const left = imgPosition.left - editorScrollLeft - 1;

    editor.append(
      createDOM('span', 'resize-frame', {
        position: 'absolute',
        top: top + imgHeight + 'px',
        left: left + imgWidth + 'px',
        border: 'solid 2px red',
        width: '6px',
        height: '6px',
        cursor: 'se-resize',
        zIndex: 1,
      }),
    );

    editor.append(
      createDOM('span', 'resizer', {
        position: 'absolute',
        top: top + 'px',
        left: left + 'px',
        border: 'dashed 1px grey',
        width: imgWidth + 'px',
        height: '0px',
      }),
    );

    editor.append(
      createDOM('span', 'resizer', {
        position: 'absolute',
        top: top + 'px',
        left: left + imgWidth + 'px',
        border: 'dashed 1px grey',
        width: '0px',
        height: imgHeight + 'px',
      }),
    );

    editor.append(
      createDOM('span', 'resizer', {
        position: 'absolute',
        top: top + imgHeight + 'px',
        left: left + 'px',
        border: 'dashed 1px grey',
        width: imgWidth + 'px',
        height: '0px',
      }),
    );
  };
  var reset = function () {
    if (currentImage != null) {
      currentImage = null;
      resizing = false;
      removeResizeFrame();
    }
    bindClickListener();
  };
  editor.addEventListener(
    'scroll',
    function () {
      reset();
    },
    false,
  );
  editor.addEventListener('mouseup', function (e) {
    if (!resizing) {
      const x = e.x ? e.x : e.clientX;
      const y = e.y ? e.y : e.clientY;
      let mouseUpElement = document.elementFromPoint(x, y);
      if (mouseUpElement) {
        let matchingElement = null;
        if (mouseUpElement.tagName === 'IMG') {
          matchingElement = mouseUpElement;
        }
        if (!matchingElement) {
          reset();
        } else {
          clickImage(matchingElement);
        }
      }
    }
  });
}
