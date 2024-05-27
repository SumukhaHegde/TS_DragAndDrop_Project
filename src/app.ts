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

    const importedNode = document.importNode(this.projectElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";

    this.configureForm();

    this.attach();

    console.log(document.getElementById("title"));
    console.log("jjahdf");
    this.titleInputElement = document.getElementById(
      "title"
    )! as HTMLInputElement;
    this.descriptionInputElement = document.getElementById(
      "description"
    )! as HTMLInputElement;

    this.personInputElement = document.getElementById(
      "people"
    )! as HTMLInputElement;
  }

  private gatherUserInputs(): [string, string, number] | void {
    const titleValue = this.titleInputElement.value;
    const descriptionValue = this.descriptionInputElement.value;

    const personValue = this.personInputElement.value;

    if (
      +personValue === 0 ||
      titleValue === null ||
      descriptionValue === null
    ) {
      return;
    } else {
      return [titleValue, descriptionValue, +personValue];
    }
  }

  private handleSubmit(e: Event) {
    e.preventDefault();
    console.log(this.titleInputElement);
    const userInput = this.gatherUserInputs();
  }

  private configureForm() {
    this.element.addEventListener("submit", this.handleSubmit.bind(this));
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const prjectInput = new ProjectList();
