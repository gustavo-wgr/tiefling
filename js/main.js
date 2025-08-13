import Alpine from './alpine.esm.js';
window.Alpine = Alpine;

import { Tiefling } from './tiefling/tiefling.js';

let tiefling = new Tiefling(document.querySelector(".tiefling"));

URLSearchParams.prototype.getRaw = function(param) {
    const regex = new RegExp(`[?&]${param}=([^&]+)`, 'i');
    const match = window.location.search.match(regex);
    return match ? match[1] : null;
};


Alpine.data('app', () => ({

    state: 'idle',
    menuVisible: false,
    displayMode: 'full',
    possibleDisplayModes: tiefling.getPossibleDisplayModes(), // full, hsbs, fsbs, anaglyph (red cyan)

    tieflingDragActive: false, // dragging image onto canvas?

    inputImageURL: '',
    inputImageFile: null,
    inputImageDragActive: false,
    inputImage: null,
    inputDataURL: '',

    depthmapImageURL: '', // loaded depthmap via url?
    depthmapImageFile: null, // or via file
    depthmapImageDragActive: false,
    depthmapImage: null,
    depthmapURL: '', // URL of depthmap (generated or loaded externally)
    depthmapDataURL: '', // URL to loaded image
    depthmapSize: tiefling.getDepthmapSize(),

    shareState: 'hidden', // hidden, ready, uploading, upoaded, error
    shareURL: '',
    shareNonce: '',
    shareURLCopied: false,

    focus: tiefling.getFocus(),
    devicePixelRatio: tiefling.getDevicePixelRatio(),
    expandDepthmapRadius: tiefling.getExpandDepthmapRadius(),
    mouseXOffset: 0.04, // for hsbs, fsbs and anaglyph modes. 0 = no 3d, 0.04 is a good default
    mouseXOffsetMin: 0,
    mouseXOffsetMax: 0.4,

    idleMovementEnabled: true,

    // optionally rotate image by rotating device
    deviceOrientationPossible: window.DeviceOrientationEvent && 'ontouchstart' in window ? true : false,
    deviceOrientationEnabled: false,

    // WebXR/VR support
    webXRSupported: tiefling.isWebXRSupported(),
    vrAvailable: false,
    vrActive: false,
    vrImageDistance: 3, // Current VR image distance in meters

    fullscreen: false, // fullscreen selected?

    bookmarkletCode: '',

    mousePosition: { x: 0, y: 0 },
    mouseDown: false,

    showPrivacyPolicy: false,

    exampleImages: [
        {
            'key': 'autochrome-89',
            'image': 'img/autochrome/cacdoha_000089_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000089_access.jpg',
            'depthmap': 'img/autochrome/89.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-110',
            'image': 'img/autochrome/cacdoha_000110_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000110_access.jpg',
            'depthmap': 'img/autochrome/110.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-116',
            'image': 'img/autochrome/cacdoha_000116_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000116_access.jpg',
            'depthmap': 'img/autochrome/116.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-122',
            'image': 'img/autochrome/cacdoha_000122_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000122_access.jpg',
            'depthmap': 'img/autochrome/122.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-123',
            'image': 'img/autochrome/cacdoha_000123_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000123_access.jpg',
            'depthmap': 'img/autochrome/123.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-140',
            'image': 'img/autochrome/cacdoha_000140_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000140_access.jpg',
            'depthmap': 'img/autochrome/140.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-149',
            'image': 'img/autochrome/cacdoha_000149_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000149_access.jpg',
            'depthmap': 'img/autochrome/149.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-152',
            'image': 'img/autochrome/cacdoha_000152_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000152_access.jpg',
            'depthmap': 'img/autochrome/152.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-154',
            'image': 'img/autochrome/cacdoha_000154_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000154_access.jpg',
            'depthmap': 'img/autochrome/154.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-156',
            'image': 'img/autochrome/cacdoha_000156_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000156_access.jpg',
            'depthmap': 'img/autochrome/156.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-161',
            'image': 'img/autochrome/cacdoha_000161_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000161_access.jpg',
            'depthmap': 'img/autochrome/161.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-196',
            'image': 'img/autochrome/cacdoha_000196_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000196_access.jpg',
            'depthmap': 'img/autochrome/196.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-321',
            'image': 'img/autochrome/cacdoha_000321_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000321_access.jpg',
            'depthmap': 'img/autochrome/321.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-345',
            'image': 'img/autochrome/cacdoha_000345_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000345_access.jpg',
            'depthmap': 'img/autochrome/345.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-412',
            'image': 'img/autochrome/cacdoha_000412_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000412_access.jpg',
            'depthmap': 'img/autochrome/412.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-422',
            'image': 'img/autochrome/cacdoha_000422_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000422_access.jpg',
            'depthmap': 'img/autochrome/422.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-443',
            'image': 'img/autochrome/cacdoha_000443_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000443_access.jpg',
            'depthmap': 'img/autochrome/443.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-457',
            'image': 'img/autochrome/cacdoha_000457_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000457_access.jpg',
            'depthmap': 'img/autochrome/457.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-490',
            'image': 'img/autochrome/cacdoha_000490_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000490_access.jpg',
            'depthmap': 'img/autochrome/490.png',
            'expandDepthmapRadius': 7
        },
        {
            'key': 'autochrome-491',
            'image': 'img/autochrome/cacdoha_000491_access.jpg',
            'thumb': 'img/autochrome/cacdoha_000491_access.jpg',
            'depthmap': 'img/autochrome/491.png',
            'expandDepthmapRadius': 7
        }
    ],


    async init() {

        this.initOrientationSensors();
        this.loadSettings();
        this.handleURLParams();

        this.generateBookmarkletLink();

        await this.initialLoadImage();

        this.updateDepthmapSize();
        this.updateFocus();
        this.updateDevicePixelRatio();
        this.updateExpandDepthmapRadius();
        this.updateIdleMovementEnabled();

        // click anywhere outside .menu or.toggle-menu: set menuVisible to false
        document.addEventListener('click', (event) => {
            if (this.menuVisible && !event.target.closest('.menu') && !event.target.closest('.toggle-menu')) {
                this.menuVisible = false;
            }
        });

        // hide interface and mouse cursor when pressing alt+h
        document.addEventListener('keydown', (event) => {
            if (event.altKey && event.code === 'KeyH') {
                document.body.classList.toggle('hide-interface');
            }
        });

        // get nonce for sharing
        try {
            await this.getShareNonce();
            this.shareState = 'ready';
        } catch (error) {
            console.error('Error getting share nonce:', error);
        }

        // Check VR availability
        if (this.webXRSupported) {
            this.vrAvailable = await tiefling.isVRAvailableAsync();
        }

    },

    initOrientationSensors() {
        if (this.deviceOrientationPossible) {
            window.addEventListener('deviceorientation', (event) => {

                if (!this.deviceOrientationEnabled || event.alpha === null || event.beta === null) return;

                let x = event.alpha; // In degree in the range [0,360)
                let y = event.beta; // In degree in the range [-180,180)

                // Because we don't want to have the device upside down
                // We constrain the x value to the range [0, 180]
                if (x > 180) { x = 360 - x; }

                // normalize to -1 to 1
                x = x / 180;
                y = y / 180;

            });
        }
    },

    // load various settings from local storage
    loadSettings() {
        this.depthmapSize = parseInt(localStorage.getItem('depthmapSize')) || this.depthmapSize;
        this.focus = localStorage.getItem('focus') ? parseFloat(localStorage.getItem('focus')) : this.focus;
        this.devicePixelRatio = parseFloat(localStorage.getItem('devicePixelRatio')) || this.devicePixelRatio;
        this.expandDepthmapRadius = localStorage.getItem('expandDepthmapRadius') ? parseInt(localStorage.getItem('expandDepthmapRadius')) : this.expandDepthmapRadius;
        this.idleMovementEnabled = localStorage.getItem('idleMovementEnabled') !== 'false';
        this.deviceOrientationEnabled = localStorage.getItem('deviceOrientationEnabled') === 'true' ?? true;
        this.displayMode = localStorage.getItem('displayMode') || this.displayMode;
        this.mouseXOffset = localStorage.getItem('mouseXOffset') ? parseFloat(localStorage.getItem('mouseXOffset')) : this.mouseXOffset;
    },


    async generateBookmarkletLink() {
        try {
            const response = await fetch('bookmarklet.js');
            this.bookmarkletCode = this.createBookmarklet(await response.text());
        } catch (error) {
            console.error('Error generating bookmarklet:', error);
        }
    },

    // add or change parameter in url
    setURLParam(name, value, replaceState = true) {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set(name, value);

        if (replaceState) {
            history.replaceState({}, '', window.location.pathname + '?' + urlParams.toString());
        } else {
            history.pushState({}, '', window.location.pathname + '?' + urlParams.toString());
        }
    },

    // create bookmarklet for current domain
    createBookmarklet(sourceCode) {
        // replace ---URL_PREFIX--- with current protocol, domain, port and path
        const urlPrefix = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');

        let code = sourceCode
            .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // Remove comments
            .replace(/\s+/g, ' ')                    // Collapse whitespace
            .replace('---URL_PREFIX---', urlPrefix)
            .trim();

        return 'javascript:' + encodeURIComponent(code);
    },


    // handle optional URL parameters
    // ?input={url} - load image from URL, generate depthmap if none given
    // ?depthmap={url} - load depthmap from URL
    // ?displayMode={full, hsbs, fsbs, anaglyph} - set display mode
    handleURLParams() {
        // ?input parameter? load image from URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('input')) {
            this.inputImageURL = this.fixRelativeURL(urlParams.get('input'));
        }

        if (urlParams.get('depthmap')) {
            this.depthmapImageURL = this.fixRelativeURL(urlParams.get('depthmap'));
        }

        if (urlParams.get('expandDepthmapRadius')) {
            this.expandDepthmapRadius = parseInt(urlParams.get('expandDepthmapRadius'));
        }

        if (urlParams.get('depthmapSize')) {
            this.depthmapSize = parseInt(urlParams.get('depthmapSize'));
        }

        // set display mode from url param
        if (urlParams.get("displayMode")) {
            this.displayMode = this.possibleDisplayModes.contains(urlParams.get("displayMode")) ? urlParams.get("displayMode") : 'full';
        }

    },


    // Helper function to fix relative URLs for GitHub Pages
    fixRelativeURL(url) {
        // If it's a relative URL (doesn't start with http/https), prepend the base path
        if (!url.match(/^https?:\/\//)) {
            // Get the base path (everything up to the last slash in the pathname)
            const basePath = window.location.pathname.replace(/\/[^\/]*$/, '/');
            // If the URL already starts with a slash, remove it to avoid double slashes
            const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
            return basePath + cleanUrl;
        }
        return url;
    },

    async initialLoadImage() {

        tiefling.setDisplayMode(this.displayMode);

        if (this.inputImageURL) {

            this.loadImage();

        } else {

            // select a random example image
            const exampleImage = this.exampleImages[Math.floor(Math.random() * this.exampleImages.length)];

            this.depthmapImageURL = this.depthmapURL = this.depthmapDataURL = this.fixRelativeURL(exampleImage.depthmap);
            this.inputImageURL = this.fixRelativeURL(exampleImage.image);
            this.loadImage();
        }

    },

    async loadImage() {
        this.state = "loading";
        this.resetShare();
        try {

            let inputURL = '';
            this.depthmapURL = '';

            // get input image from url or uploaded or dragged file
            if (this.inputImageFile) {
                this.inputImage = this.inputImageFile;
            } else if (this.inputImageURL) {
                this.inputImage = await fetch(this.inputImageURL).then(response => response.blob());
            }

            // get depthmap image from url, uploaded or dragged file
            if (this.depthmapImageFile) {
                this.depthmapImage = this.depthmapImageFile;
                this.depthmapURL = URL.createObjectURL(this.depthmapImage);

            } else if (this.depthmapImageURL) {
                this.depthmapURL = this.depthmapImageURL;
                this.depthmapImage = await fetch(this.depthmapImageURL).then(response => response.blob());
            }

            if (this.depthmapImage) {
                tiefling.load3DImage(URL.createObjectURL(this.inputImage), URL.createObjectURL(this.depthmapImage));

            } else {
                this.depthmapURL = await tiefling.getDepthmapURL(this.inputImage);

                this.depthmapImage = await fetch(this.depthmapURL).then(response => response.blob());

                tiefling.load3DImage(URL.createObjectURL(this.inputImage), this.depthmapURL);

            }

            this.depthmapDataURL = URL.createObjectURL(this.depthmapImage);
            this.inputDataURL = URL.createObjectURL(this.inputImage);


            // add ?input (and optional &depthmap) parameter to history
            // For relative URLs, we need to store the original relative path, not the fixed absolute URL
            const urlParams = new URLSearchParams(window.location.search);
            const originalInputURL = urlParams.get('input') || this.inputImageURL;
            const originalDepthmapURL = urlParams.get('depthmap') || this.depthmapURL;
            
            if (originalInputURL) {
                this.setURLParam('input', originalInputURL);
                if (originalDepthmapURL) {
                    this.setURLParam('depthmap', originalDepthmapURL);
                }
            }

            this.state = "idle";
        } catch (error) {
            console.error("Error while loading image:", error);
            this.state = "error";
        }


    },



    // Handle file drop on whole canvas
    async tieflingImageFileDrop(event) {

        const file = event.dataTransfer.files[0];
        if (!file || !file.type.match('^image/')) {
            console.error("Dropped file is not an image");
            this.tieflingDragActive = false;
            return;
        }

        try {
            this.tieflingDragActive = false;

            this.inputImageFile = file;

            this.depthmapImageURL = '';
            this.depthmapDataURL = '';
            this.depthmapImage = null;

            this.loadImage();

        } catch (error) {
            console.error("Error while handling dropped file:", error);
            this.state = "error";
        }
    },


    // on input image file upload
    async handleInputImageFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.inputImageURL = "";
        this.inputImageFile = file;

        this.inputDataURL = URL.createObjectURL(file);

        // clear depthmap
        this.depthmapImage = this.depthmapImageFile = this.depthmapImageURL = this.depthmapURL = this.depthmapDataURL = null;
        this.resetShare();
    },

    // Handle file drop on input field
    async handleInputImageFileDrop(event) {

        const file = event.dataTransfer.files[0];
        if (!file || !file.type.match('^image/')) {
            console.error("Dropped file is not an image");
            this.inputImageDragActive = false;
            return;
        }

        try {
            // Reset drag state and update status
            this.inputImageDragActive = false;
            this.inputImageURL = "";

            this.inputImageFile = file;
            this.inputDataURL = URL.createObjectURL(file);

            // clear depthmap
            this.depthmapImage = this.depthmapImageFile = this.depthmapImageURL = this.depthmapURL = this.depthmapDataURL = null;

        } catch (error) {
            console.error("Error while handling dropped file:", error);
            this.state = "error";
        }
        this.resetShare();
    },

    // on depthmap file upload
    async handleDepthmapImageFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        this.depthmapImageURL = "";
        this.depthmapImageFile = file;
        this.depthmapDataURL = URL.createObjectURL(file);
        this.resetShare();
    },


    // Handle file drop on depthmap field
    async handleDepthmapImageFileDrop(event) {

        const file = event.dataTransfer.files[0];
        if (!file || !file.type.match('^image/')) {
            console.error("Dropped file is not an image");
            this.depthmapImageDragActive = false;
            return;
        }

        try {
            // Reset drag state and update status
            this.depthmapImageDragActive = false;
            this.depthmapImageURL = "";
            this.depthmapImageFile = file;
            this.depthmapDataURL = URL.createObjectURL(file);

        } catch (error) {
            console.error("Error while handling dropped file:", error);
            this.state = "error";
        }

        this.resetShare();
    },

    removeDepthmap() {
        this.depthmapImage = this.depthmapImageFile = this.depthmapImageURL = this.depthmapURL = this.depthmapDataURL = null;
    },

    removeInputImage() {
        this.inputImage = this.inputImageFile = this.inputImageURL = this.inputDataURL = null;
    },


    // get nonce from api.php for sharing. POST request, send form data
    async getShareNonce() {
        try {
            const response = await fetch('./api.php', {
                method: 'POST',
                body: new URLSearchParams({
                    'action': 'getShareNonce'
                })
            });

            const data = await response.json();
            if (data.state === 'success') {
                this.shareNonce = data.data;
            } else {
                throw new Error('Error getting nonce: ' + data.data);
            }

        } catch (error) {
            throw new Error('Error getting nonce: ' + error);
        }

    },

    async onShare() {

        if (!this.shareNonce) return;

        this.shareState = 'uploading';

        const uploadedInputURL = await this.uploadFile(this.inputDataURL);
        const uploadedDepthmapURL = await this.uploadFile(this.depthmapDataURL);

        if (uploadedInputURL && uploadedDepthmapURL) {
            this.shareURL = `${window.location.origin}${window.location.pathname}?input=${encodeURIComponent(uploadedInputURL)}&depthmap=${encodeURIComponent(uploadedDepthmapURL)}&expandDepthmapRadius=${this.expandDepthmapRadius}`;
            this.shareState = 'uploaded';
        } else {
            this.shareState = 'error';
        }

    },

    copyShareURL() {
        navigator.clipboard.writeText(this.shareURL).then(() => {
            console.log('Share URL copied to clipboard');
        }, (error) => {
            console.error('Error copying share URL to clipboard:', error);
        });
        this.shareURLCopied = true;
        setTimeout(() => {
            this.shareURLCopied = false;
        }, 1000);
    },

    resetShare() {
        this.shareState = 'ready';
        this.shareURL = '';
    },

    /**
     * upload file to api.php
     * @param {string} fileURL - URL to file to upload (can be blob url)
     * @return {Promise<string>} - url or null
     */
    async uploadFile(fileURL) {
        if (!fileURL) return null;

        const file = await fetch(fileURL).then(response => response.blob());
        const data = new FormData();
        data.append('action', 'uploadImage');
        data.append('file', file);
        data.append('shareNonce', this.shareNonce);

        try {
            const response = await fetch('./api.php', {
                method: 'POST',
                body: data
            });

            const responseData = await response.json();
            if (responseData.state === 'success') {
                return responseData.data;
            } else {
                console.error('Error uploading file:', responseData.data);
                return null;
            }

        } catch (error) {
            console.error('Error uploading file:', error);
            return null;
        }

    },


    updateIdleMovementEnabled() {
        tiefling.setIdleMovementEnabled(this.idleMovementEnabled);
        localStorage.setItem('idleMovementEnabled', this.idleMovementEnabled);
    },

    updateDeviceOrientationEnabled() {
        localStorage.setItem('deviceOrientationEnabled', this.deviceOrientationEnabled);
    },

    updateFocus() {
        tiefling.setFocus(this.focus);
        localStorage.setItem('focus', this.focus);
    },

    updateDepthmapSize() {
        tiefling.setDepthmapSize(parseInt(this.depthmapSize));
        localStorage.setItem('depthmapSize', this.depthmapSize);
    },

    updateDevicePixelRatio() {
        tiefling.setDevicePixelRatio(parseFloat(this.devicePixelRatio));
        localStorage.setItem('devicePixelRatio', this.devicePixelRatio);
    },

    updateExpandDepthmapRadius() {
        tiefling.setExpandDepthmapRadius(parseInt(this.expandDepthmapRadius));
        localStorage.setItem('expandDepthmapRadius', this.expandDepthmapRadius);
    },

    updateDisplayMode() {
        localStorage.setItem('displayMode', this.displayMode);

        // re-init 3d view
        tiefling.setDisplayMode(this.displayMode);
        tiefling.load3DImage(this.inputDataURL, this.depthmapDataURL);
    },

    updateMouseXOffset() {
        localStorage.setItem('mouseXOffset', this.mouseXOffset);
        tiefling.setMouseXOffset(this.mouseXOffset);
    },


    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.body.requestFullscreen();
        }

        // if user presses esc or something and exits fullscreen:
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                this.fullscreen = false;
            }
        });

    },

    adjustMouseXOffset() {
        // in vr mode, only consider the left side
        if (this.displayMode === 'hsbs' || this.displayMode === 'fsbs') {
            const xPos = this.mousePosition.x/2;
            const xPosMax = window.innerWidth / 2;

            // adjust 3d strength / mouseXOffset
            this.mouseXOffset = (xPos / xPosMax) * this.mouseXOffsetMax;

            tiefling.setMouseXOffset(this.mouseXOffset);

        }
    },

    onMouseDown(event) {
        this.mouseDown = true;
        this.mousePosition.x = event.clientX;
        this.mousePosition.y = event.clientY;
        this.adjustMouseXOffset()
    },
    onMouseUp(event) {
        this.mouseDown = false;
    },

    onMouseMove(event) {
        this.mousePosition.x = event.clientX;
        this.mousePosition.y = event.clientY;

        if (this.mouseDown) {
            this.adjustMouseXOffset();
        }
    },

    // WebXR/VR methods
    async enterVR() {
        if (!this.vrAvailable) {
            alert('VR not available on this device');
            return;
        }

        try {
            this.vrActive = await tiefling.enterVR();
            if (this.vrActive) {
                console.log('Entered VR mode');
            }
        } catch (error) {
            console.error('Failed to enter VR:', error);
            alert('Failed to enter VR: ' + error.message);
        }
    },

    exitVR() {
        tiefling.exitVR();
        this.vrActive = false;
        console.log('Exited VR mode');
    },

    // Update VR status
    updateVRStatus() {
        this.vrActive = tiefling.isVRActive();
        if (this.vrActive) {
            this.vrImageDistance = tiefling.getVRDistance();
        }
    },

    // VR Distance Control methods
    adjustVRDistance(delta) {
        if (this.vrActive && tiefling) {
            tiefling.updateVRDistance(delta);
            this.vrImageDistance = tiefling.getVRDistance();
        }
    },

    setVRDistance(distance) {
        if (tiefling) {
            tiefling.setVRDistance(distance);
            this.vrImageDistance = tiefling.getVRDistance();
        }
    }




}));

Alpine.start()


