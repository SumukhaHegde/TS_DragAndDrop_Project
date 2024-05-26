class ProjectList {
  hostElement: HTMLTemplateElement;
  projectElement: HTMLTemplateElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  personInputElement: HTMLInputElement;

  descriptionInputElement: HTMLInputElement;

  constructor() {
    this.projectElement = document.querySelector(
      "#project-input"
    ) as HTMLTemplateElement;
    this.hostElement = document.querySelector("#app")! as HTMLTemplateElement;
    this.titleInputElement = document.getElementById(
      "title"
    )! as HTMLInputElement;
    this.descriptionInputElement = document.getElementById(
      "description"
    )! as HTMLInputElement;

    this.personInputElement = document.getElementById(
      "people"
    )! as HTMLInputElement;

    const importedNode = document.importNode(this.projectElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";

    this.attach();
    this.configureForm();
  }

  private handleSubmit(e: any) {
    e.preventDefalut();
  }

  private configureForm() {
    document.addEventListener("submit", this.handleSubmit);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const prjectInput = new ProjectList();
