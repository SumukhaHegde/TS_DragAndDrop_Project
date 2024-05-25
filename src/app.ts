class ProjectList {
  hostElement: HTMLTemplateElement;
  projectElement: HTMLTemplateElement;
  element: HTMLFormElement;
  constructor() {
    this.projectElement = document.querySelector(
      "#project-input"
    ) as HTMLTemplateElement;
    this.hostElement = document.querySelector("#app")! as HTMLTemplateElement;

    const importedNode = document.importNode(this.projectElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;

    this.attach();
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const prjectInput = new ProjectList();
