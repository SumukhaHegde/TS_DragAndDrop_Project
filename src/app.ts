enum projectStatus {
  Active = "active",
  Finished = "finished",
}

type Listerner<T> = (items: T) => void;

class State<T> {
  protected listerners: Listerner<T>[] = [];

  addListerners(listernerFunction: Listerner<T>) {
    this.listerners.push(listernerFunction);
  }
}

class Project {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public person: number,
    public projectStatus: projectStatus
  ) {}
}

class ProjectState extends State<Project> {
  private projects: Project = {
    id: 0,
    title: "",
    description: "",
    person: 0,
    projectStatus: projectStatus.Active,
  };
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    } else {
      this.instance = new ProjectState();
      return this.instance;
    }
  }

  addProjects(title: string, description: string, person: number) {
    const project = new Project(
      Math.random(),
      title,
      description,
      person,
      projectStatus.Active
    );
    this.projects = project;
    for (const listernerFn of this.listerners) {
      listernerFn(this.projects);
    }
  }
}

const projectState = ProjectState.getInstance();

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  hostElement: T;
  targetElement: HTMLTemplateElement;
  element: U;

  constructor(
    templateId: string,
    hostId: string,
    isAtStart: boolean,
    elementId?: string
  ) {
    this.targetElement = document.getElementById(
      templateId
    ) as HTMLTemplateElement;

    this.hostElement = document.getElementById(hostId)! as T;
    debugger;
    console.log(this.hostElement);

    const importedNode = document.importNode(this.targetElement.content, true);
    this.element = importedNode.firstElementChild as U;
    if (elementId) {
      this.element.id = elementId;
    }
    this.attach(isAtStart);
  }
  private attach(isBegining: boolean) {
    debugger;
    this.hostElement.insertAdjacentElement(
      isBegining ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {
  private project: Project;
  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id.toString());
    this.project = project;
    this.configure();
    this.renderContent();
  }
  configure() {}
  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent =
      this.project.person.toString();
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

class ProjectList extends Component<HTMLTemplateElement, HTMLElement> {
  assignedProjects: Project | undefined = {
    id: 0,
    title: "",
    description: "",
    person: 0,
    projectStatus: projectStatus.Active,
  };

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);

    this.configure();

    this.renderContent();
  }

  configure(): void {
    projectState.addListerners((projects: Project) => {
      let filteredProjects;
      if (this.type === "active") {
        filteredProjects = projects;
      }

      this.assignedProjects = filteredProjects;
      this.renderProjects();
    });
  }
  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;

    if (this.assignedProjects !== undefined) {
      debugger;
      console.log(this.element.querySelector("ul")!.id);
      new ProjectItem(
        this.element.querySelector("ul")!.id,
        this.assignedProjects
      );
    }
  }

  renderContent() {
    const listElementId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listElementId;
    this.element.querySelector("h2")!.textContent =
      `${this.type}`.toUpperCase() + " PROJECTS LIST";
  }
}

class ProjectInput extends Component<HTMLTemplateElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  personInputElement: HTMLInputElement;

  descriptionInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

    this.configure();

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

  configure() {
    this.element.addEventListener("submit", this.handleSubmit.bind(this));
  }

  renderContent(): void {}
}

const prjectInput = new ProjectInput();
const prjectActiveList = new ProjectList("active");
const projectFinishedList = new ProjectList("finished");
