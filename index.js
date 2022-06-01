const $ = document.querySelector.bind(document)
const $$ = document.querySelector.bind(document)

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER'

const cd = $('.cd')
const heading = $('header h2')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('.progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const songBody = $('.song')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Đám cưới nha?',
            singer: 'Hồng Thanh',
            path: './assets/music/song1.mp3'
        },
        {
            name: 'Không thể yêu, không thể quên',
            singer: 'Khang Việt',
            path: './assets/music/song2.mp3'
        },
        {
            name: 'Thương em',
            singer: 'Châu Khải Phong',
            path: './assets/music/song3.mp3'
        },
        {
            name: 'Có không giữ mất đừng tìm',
            singer: 'Trúc Nhân',
            path: './assets/music/song4.mp3'
        },
        {
            name: 'Trọn vẹn nghĩa tình',
            singer: 'Ưng Hoàng Phúc',
            path: './assets/music/song5.mp3'
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex? 'active': ''}" data-index=${index}>
                <div class="thumb" style="background-image: url('https://i.ytimg.com/vi/jTLhQf5KJSc/maxresdefault.jpg')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>`
        })

        playlist.innerHTML = htmls.join('')

    },
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    hanldeEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        const cdAnimate = cd.animate([
            { transform:'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdAnimate.pause()

        document.onscroll = function() {
            const scroll = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scroll

            cd.style.width = newCdWidth < 50 ? 0 : newCdWidth + 'px'
            cd.style.opacity = newCdWidth / cdWidth
        }

        playBtn.onclick = function() {
            if (_this.isPlaying){
                audio.pause()
            }else {
                audio.play()
            }
        }

        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdAnimate.play()
        }

        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdAnimate.pause()
        }

        audio.ontimeupdate = function() {
            if(audio.duration){ 
                const time =Math.floor((audio.currentTime / audio.duration) * 100)
                progress.value = time
            }
        }

        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.randomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToView()
        }

        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.randomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToView()
        }

        audio.onended = function () {
            if(_this.isRepeat) {
                audio.play()
            }else {
                nextBtn.click()
            }
        }

        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')){
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
                }
            }
        }

        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active')
        }

        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        progress.oninput = function() {
            audio.currentTime = Math.floor((progress.value * audio.duration) /100)
        }
    },
    scrollToView: function() {
        setTimeout(() => {    
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            })
        }, 300);
    },
    loadCurrentSong: function() {
        const nameCurrentSong = this.currentSong.name

        heading.textContent = nameCurrentSong
        audio.src = this.currentSong.path

    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    randomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex == this.currentIndex)
        this.currentIndex = newIndex

        this.loadCurrentSong()
    },
    start: function() {
        this.loadConfig()

        this.defineProperties()

        this.render()

        this.loadCurrentSong()
        
        this.hanldeEvents()

        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()