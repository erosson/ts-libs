export function timer(set: (t: Date) => void) {
    function frame() {
        set(new Date());
        window.requestAnimationFrame(frame);
    }
    frame();
}