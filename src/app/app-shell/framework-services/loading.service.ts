import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private renderer: Renderer2;

    constructor(private rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);
    }

    show() {
        const modal = this.renderer.selectRootElement('#loadingmodal', true);
        this.renderer.addClass(modal, 'show');
        this.renderer.setStyle(modal, 'display', 'block');
        this.renderer.setAttribute(modal, 'aria-modal', 'true');
        this.renderer.setAttribute(modal, 'role', 'dialog');
    }

    hide() {
        const modal = this.renderer.selectRootElement('#loadingmodal', true);
        this.renderer.removeClass(modal, 'show');
        this.renderer.setStyle(modal, 'display', 'none');
        this.renderer.removeAttribute(modal, 'aria-modal');
        this.renderer.removeAttribute(modal, 'role');
    }
}
