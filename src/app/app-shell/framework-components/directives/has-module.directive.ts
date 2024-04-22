import {
  Directive,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  Input,
} from '@angular/core';

@Directive({
  selector: '[hasModule]',
})
export class HasModuleDirective implements OnInit {
  private neededModule;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit() {}

  @Input()
  set hasPermission(val) {
    this.neededModule = val;
    this.updateView();
  }

  private updateView() {
    if (true) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
