/**
 * @fileoverview dragscroll - scroll area by dragging
 * @version 0.0.8
 * 
 * @license MIT, see http://github.com/asvd/dragscroll
 * @copyright 2015 asvd <heliosframework@gmail.com> 
 */


var _window = window;
var _document = document;
var mousemove = 'mousemove';
var mouseup = 'mouseup';
var mousedown = 'mousedown';
var mouseenter = 'mouseenter';
var click = 'click';
var EventListener = 'EventListener';
var addEventListener = 'add'+EventListener;
var removeEventListener = 'remove'+EventListener;
var newScrollX, newScrollY;
var moveThreshold = 4;
var speedX, speedY;
var lastScrollLeft, lastScrollTop;
var lastWidth, lastHeight;
var enabled = true;
var dragged = [];

function disable() {
    enabled = false;
}

function enable() {
    enabled = true;
}

function dragscroll() {
    var i, el, direction;

    for (i = 0; i < dragged.length;) {
        el = dragged[i++];
        el = el.container || el;
        el[removeEventListener](mousedown, el.md, 0);
        el[removeEventListener](click, el.mc, 0);
        _window[removeEventListener](mouseup, el.mu, 0);
        _window[removeEventListener](mousemove, el.mm, 0);
        _document[removeEventListener](mouseenter, el.me, 0);
    }

    // cloning into array since HTMLCollection is updated dynamically
    dragged = [].slice.call(_document.getElementsByClassName('dragscroll'));
    for (i = 0; i < dragged.length;) {
        (function(el, lastClientX, lastClientY, startX, startY, moved, pushed, scroller, cont){
            (cont = el.container || el)[addEventListener](
                mousedown,
                cont.md = function(e) {
                    if (enabled &&
                        (!el.hasAttribute('nochilddrag') ||
                                                    _document.elementFromPoint(
                                                        e.pageX, e.pageY
                                                    ) == cont)
                    ) {
                        pushed = 1;
                        moved = 0;
                        direction = 0;

                        startX = lastClientX = e.clientX;
                        startY = lastClientY = e.clientY;
                        lastScrollLeft = e.scrollLeft;
                        lastScrollTop = e.scrollTop;
                        lastWidth = e.scrollWidth || 0;
                        lastHeight = e.scrollHeight || 0;

                        e.preventDefault();
                        e.stopPropagation();
                    }
                }, 0
            );
            (cont = el.container || el)[addEventListener](
              click,
              cont.mc = function(e) {
                if (moved) {
                  e.preventDefault();
                  e.stopPropagation();
                  moved = 0; pushed = 0;
                }
              }, 1
            );
            _window[addEventListener](
                mouseup, cont.mu = function() {
                    pushed = 0;

                    // If we were moving and now released the mouse, we need to scroll a bit further to stop slowly/in a decelerating manner.
                    if (moved && (speedX || speedY)) {
                        function decelarate() {

                            if (Math.abs(speedX) > 1 || Math.abs(speedY) > 1) {
                                scroller.scrollLeft += (speedX *= (Math.abs(speedX) < 3? 0.96: 0.94));
                                scroller.scrollTop += (speedY *= (Math.abs(speedY) < 3? 0.96: 0.94));

                                window.requestAnimationFrame(decelarate);
                            }
                            else {
                                decelarating = false;
                            }
                        }

                        decelarating = true;
                        window.requestAnimationFrame(decelarate);
                    }
                }, 0
            );
            _document[addEventListener](
              mouseenter, cont.me = function(e) {if (!e.buttonsPressed) pushed = 0;}, 0
            );
            _window[addEventListener](
                mousemove,
                cont.mm = function(e) {
                    if (pushed) {
                      if (!moved &&
                        (Math.abs(e.clientX - startX) > moveThreshold ||
                         Math.abs(e.clientY - startY) > moveThreshold)) {
                           moved = true;
                         }
                      if (moved) {

                        var widthChange = lastWidth? el.scrollWidth - lastWidth: 0;
                        var heightChange = lastHeight ? el.scrollHeight - lastHeight: 0;

                        (scroller = el.scroller||el).scrollLeft -=
                            newScrollX = (- lastClientX + widthChange + (lastClientX=e.clientX));
                        scroller.scrollTop -=
                            newScrollY = (- lastClientY + heightChange + (lastClientY=e.clientY));
                        if (el == _document.body) {
                            (scroller = _document.documentElement).scrollLeft -= newScrollX;
                            scroller.scrollTop -= newScrollY;
                        }

                        speedX = scroller.scrollLeft - (lastScrollLeft || scroller.scrollLeft);
                        speedY = scroller.scrollTop - (lastScrollTop || scroller.scrollTop);

                        lastScrollLeft = scroller.scrollLeft;
                        lastScrollTop = scroller.scrollTop;

                        lastWidth = scroller.scrollWidth;
                        lastHeight = scroller.scrollHeight;
                      }
                    }
                }, 0
            );
         })(dragged[i++]);
    }
}

dragscroll.enable = enable;
dragscroll.disable = disable;
module.exports = dragscroll;
