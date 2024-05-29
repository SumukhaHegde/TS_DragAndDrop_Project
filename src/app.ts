enum projectStatus {
  Active = "active",
  Finished = "finished",
}

type Listerner = (items: Project[]) => void;

class Project {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public person: number,
    public projectStatus: projectStatus
  ) {}
}

class ProjectState {
  private projects: Project[] = [];
  private static instance: ProjectState;
  private listerners: Listerner[] = [];

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    } else {
      this.instance = new ProjectState();
      return this.instance;
    }
  }

  addListerners(listernerFunction: Function) {
    this.listerners.push(listernerFunction);
  }

  addProjects(title: string, description: string, person: number) {
    const project = new Project(
      Math.random(),
      title,
      description,
      person,
      projectStatus.Active
    );

    this.projects.push(project);
    for (const listernerFn of this.listerners) {
      console.log(this);
      console.log(listernerFn);
      listernerFn(this.projects);
    }
  }
}

const projectState = ProjectState.getInstance();

class ProjectList {
  hostElement: HTMLTemplateElement;
  projectElement: HTMLTemplateElement;
  element: HTMLElement;
  assignedProjects: Project[] = [];

  constructor(private type: "active" | "finished") {
    this.projectElement = document.querySelector(
      "#project-list"
    ) as HTMLTemplateElement;
    this.hostElement = document.querySelector("#app")! as HTMLTemplateElement;

    const importedNode = document.importNode(this.projectElement.content, true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${type}-projects`;

    projectState.addListerners((projects: Project[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }
  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    for (const prjItm of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = prjItm.title;

      listEl.appendChild(listItem);
    }
  }

  private renderContent() {
    const listElementId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listElementId;
    this.element.querySelector("h2")!.textContent =
      `${this.type}`.toUpperCase() + " PROJECTS LIST";
  }
  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }
}

class ProjectInput {
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
      personValue.trim().length === 0 ||
      titleValue.trim().length === 0 ||
      descriptionValue.trim().length === 0
    ) {
      alert("Please enter a value");
      return;
    } else {
      return [titleValue, descriptionValue, +personValue];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.personInputElement.value = "";
  }
  private handleSubmit(e: Event) {
    e.preventDefault();
    const userInput = this.gatherUserInputs();
    if (Array.isArray(userInput)) {
      const [title, description, person] = userInput;
      projectState.addProjects(title, description, person);
      this.clearInputs();
    }
  }

  private configureForm() {
    this.element.addEventListener("submit", this.handleSubmit.bind(this));
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const prjectInput = new ProjectInput();
const prjectActiveList = new ProjectList("active");
//const projectFinishedList = new ProjectList("finished");
