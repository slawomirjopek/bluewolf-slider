(function(d, w) {
    'use strict';

    // consts
    var CLASSNAMES = {
        INNER_WRAPPER: 'bw-inner-wrapper',
        SLIDE: 'bw-slide-item',
        ARROW: 'bw-arrow',
        ARROW_LEFT: 'bw-arrow-left',
        ARROW_RIGHT: 'bw-arrow-right',
        CURRENT: 'bw-current'
    };

    var DIRECTIONS = {
        PREV: 'prev',
        NEXT: 'next'
    }

    var EVENTS = {
        CLICK: 'click'
    }

    var DEFAULTS = {
        AUTO: true,
        INTERVAL: 2000,
        SPEED: 2000,
    };

    // private vars
    var _interval = null;

    var bwSlider = function(container, options) {
        if (!container) {
            throw new Error('Missing slider container selector')
        }

        var $slider = d.querySelector(container);

        if ($slider === null) {
            throw new TypeError('Invalid container')
        }

        if (!(this instanceof bwSlider)) return new bwSlider(container, options);

        var self = this;
        this.$slider = {};
        this.$slider.container = $slider;
        this.slides = $slider.children.length;
        this.index = {
            current: 0,
            prev: null,
            set: function(index) {
                this.prev = this.current;
                this.current = index;
                _animation.call(self);
            },
            get: function() {
                return this.current
            },
            getPrev: function () {
                return this.prev
            }
        };

        this.setOptions(options);
        this.buildSlider();
        this.buildControls();
        _attachEvents.call(this);

        if (DEFAULTS.AUTO) {
            this.play();
        }
    };

    bwSlider.prototype.setOptions = function(options) {
        if (typeof options !== 'object' && options !== null) {
            return this.options = DEFAULTS
        }

        Object.keys(DEFAULTS).forEach(function(k) {
            if (DEFAULTS[k] === undefined) options[k] = DEFAULTS[k]
        });

        this.options = options
    };

    bwSlider.prototype.buildSlider = function() {
        var $innerWrapper = document.createElement('div');
        $innerWrapper.className = CLASSNAMES.INNER_WRAPPER;

        var length = [].slice.call(this.$slider.container.children);
        var process = function($slide, index) {
            $slide.className = CLASSNAMES.SLIDE;

            if (index === this.index.get()) {
                $slide.className += ' ' + CLASSNAMES.CURRENT;
            }

            $innerWrapper.appendChild($slide);
        };

        length.forEach(process.bind(this));

        this.$slider.container.appendChild($innerWrapper);
        this.$slider.slides = this.$slider.container.querySelectorAll('.bw-slide-item');
    };

    bwSlider.prototype.buildControls = function() {
        if (this.$slider.slides.length <= 1) return;

        var $leftArrow = document.createElement('span');
        var $rightArrow = document.createElement('span');

        this.$slider.arrows = {
            left: $leftArrow,
            right: $rightArrow
        };

        $leftArrow.classList.add(
            CLASSNAMES.ARROW,
            CLASSNAMES.ARROW_LEFT
        );
        $rightArrow.classList.add(
            CLASSNAMES.ARROW,
            CLASSNAMES.ARROW_RIGHT
        );

        this.$slider.container.appendChild($leftArrow);
        this.$slider.container.appendChild($rightArrow);
    };

    bwSlider.prototype.moveTo = function(index) {
        this.pause();

        if (index <= 0 || index >= this.slides) {
            throw new Error('Invalid slide index')
        }

        this.index.set(index);
    };

    bwSlider.prototype.prev = function(pause) {
        if (pause) {
            this.pause();
        }

        if (this.index.get() - 1 < 0) {
            return this.index.set(this.slides - 1);
        }

        this.index.set(this.index.get() - 1);
    };

    bwSlider.prototype.next = function(pause) {
        if (pause) {
            this.pause();
        }

        if (this.index.get() >= this.slides - 1) {
            return this.index.set(0)
        }

        this.index.set(this.index.get() + 1);
    };

    bwSlider.prototype.pause = function() {
        if (_interval) {
            _interval = clearInterval(_interval);
        }
    };

    bwSlider.prototype.play = function() {
        if (!_interval) {
            _interval = setInterval(this.next.bind(this), DEFAULTS.INTERVAL);
        }
    };

    bwSlider.prototype.destroy = function() {
        if (!(this instanceof bwSlider)) return;

        _detachEvents.call(this);
        this.$slider.container.remove();
        delete this.$slider;
        delete this.options;
    };

    w.bwSlider = bwSlider;

    // private methods
    function _animation() {
        var classList = [CLASSNAMES.CURRENT];

        _removeClass(classList, this.$slider.slides[this.index.getPrev()]);
        _addClass(classList, this.$slider.slides[this.index.get()]);
    }

    function _addClass(classList, $element) {
        classList.forEach(function(className) {
            $element.classList.add(className)
        })
    }

    function _removeClass(classList, $element) {
        classList.forEach(function(className) {
            $element.classList.remove(className)
        })
    }

    function _attachEvents() {
        this.$slider.arrows.left.addEventListener(EVENTS.CLICK, this.prev.bind(this, true));
        this.$slider.arrows.right.addEventListener(EVENTS.CLICK, this.next.bind(this, true));
    }

    function _detachEvents() {
        this.$slider.arrows.left.removeEventListener(EVENTS.CLICK, this.prev);
        this.$slider.arrows.right.removeEventListener(EVENTS.CLICK, this.next);
    }
})(document, window);

/* polyfill for DOM.remove() */
(function (arr) {
    arr.forEach(function (item) {
        if (item.hasOwnProperty('remove')) {
            return;
        }
        Object.defineProperty(item, 'remove', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function remove() {
                this.parentNode.removeChild(this);
            }
        });
    });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

