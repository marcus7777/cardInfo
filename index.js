var addMe = {}

function theApp (req, res) {
  var jsdom = require("jsdom");

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
    jsdom.env(
      decodeURIComponent(req.params.url) ,
      function (err, window) {
        var description = window.document.querySelector("meta[name=\'description\']");
        if (description) description = description.getAttribute("content");

        var cardIcon = window.document.querySelector("link[sizes=\'144x144\']");
        if (cardIcon) cardIcon = cardIcon.getAttribute("href");
        
        function getUrl(theurlOfImage, url) {
          if (theurlOfImage.startsWith("//")) {
            if (url.startsWith("https://")) {
              return "https:"+theurlOfImage
            } else {
              return "http:"+theurlOfImage
            }
          } else if (theurlOfImage.startsWith("/")) {
            return getBase(url) + theurlOfImage
          } else if (theurlOfImage.startsWith("http://")) {
            return theurlOfImage
          } else if (theurlOfImage.startsWith("https://")) {
            return theurlOfImage
          } else {
            var arrayUrl = url.split('/')
            arrayUrl.pop()
            return arrayUrl.join('/') + "/" + theurlOfImage
          }
        }

        function getBase(theUrl) {
          var re = /(https?:\/\/[^\/]*)/gi
          var res = theUrl.match(re)
          if (Array.isArray(res) && res.length > 0) {
            return res[0]
          }
        }

        function getImages(url, images, callMe) {
          if (images.length) {
            var output = []
            var gotImages = 0
            for (var i = 0; i < images.length || (gotImages > 5 && images.length > 9); i++) {
              if (images[i] !== undefined && images[i].src && ((images[i].width > 130 || images[i].width === 0) || images.length < 10))  {
                loadImage(getUrl(images[i].src, url))
                gotImages++
              }
            }
          }
          callMe()
        }

        addMe.title = window.document.title
        addMe.desc = description
        addMe.cardIcon = cardIcon
//        getImages(req.params.url, window.document.images, function(){
          res.send(JSON.stringify(addMe))
//        })
//        res.send("title: "+ window.document.title +"<br/>  description: "+ description +"<br/> cardIcon:"+ cardIcon );
      }
    );

  function loadImage(theUrl) {
    var img = new Image()
    img.src = theUrl

    img.onload = function () {
      if (!gotIt && img.width > 120 && !theUrl.endsWith(".ico")) {
        gotIt = true
        canvas.height = canvas.width * (img.height / img.width)
        var octx = canvas.getContext('2d')
        octx.fillStyle = "#FFF"
        octx.fillRect(0, 0, canvas.width, canvas.height)
        octx.drawImage(img, 0, 0, canvas.width, canvas.height)
        addMe.image = ""+canvas.toDataURL("image/jpeg")
      } else {
        canvas.height = canvas.width * (img.height / img.width)
        var octx = canvas.getContext('2d')
        octx.fillStyle = "#FFF"
        octx.fillRect(0, 0, canvas.width, canvas.height)
        octx.drawImage(img, 0, 0, canvas.width, canvas.height)
        if (!Array.isArray(addMe.alt)) {
          addMe.alt = []
        }
        if (addMe.alt.indexOf(""+canvas.toDataURL("image/jpeg")) === -1) {
          addMe.alt.push(""+canvas.toDataURL("image/jpeg"))
        }
      }
    }
  }
  function doStuffWithDom(data) {
    if (data) {
    }
  }
  //getImages(req.params.url, data.images)
}

require('letsencrypt-express').create({

  server: 'https://acme-v01.api.letsencrypt.org/directory'
, email: 'marcus7777@gmail.com'
, agreeTos: true
, approveDomains: [ 'dev.open-elements.org' ]
, app: require('express')().use('/url/:url', theApp)

}).listen(80, 443);
