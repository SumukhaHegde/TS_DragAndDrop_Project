//drop and drop interfaces
interface Dragrable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

enum projectStatus {
  Active = "active",
  Finished = "finished",
}

type Listerner<T> = (items: T[]) => void;

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
  private projects: Project[] = [];
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
    this.projects.push(project);
    this.updateListerners();
  }

  moveProject(id: string, newStatus: projectStatus) {
    const project = this.projects.find((prj) => prj.id.toString() === id);
    if (project && project.projectStatus !== newStatus) {
      project.projectStatus = newStatus;
      this.updateListerners();
    }
  }

  private updateListerners() {
    for (const listernerFn of this.listerners) {
      listernerFn(this.projects.slice());
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

    const importedNode = document.importNode(this.targetElement.content, true);
    this.element = importedNode.firstElementChild as U;
    if (elementId) {
      this.element.id = elementId;
    }
    this.attach(isAtStart);
  }
  private attach(isBegining: boolean) {
    this.hostElement.insertAdjacentElement(
      isBegining ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Dragrable
{
  private project: Project;
  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id.toString());
    this.project = project;
    this.configure();
    this.renderContent();
  }

  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.project.id.toString());
    event.dataTransfer!.effectAllowed = "move";
  }

  dragEndHandler(event: DragEvent): void {}
  configure() {
    this.element.addEventListener(
      "dragstart",
      this.dragStartHandler.bind(this)
    );
    this.element.addEventListener("dragend", this.dragEndHandler.bind(this));
  }
  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent =
      this.project.person.toString();
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

class ProjectList
  extends Component<HTMLTemplateElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[] = [];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);

    this.configure();

    this.renderContent();
  }

  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }
  dropHandler(event: DragEvent): void {
    const prjctId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      prjctId,
      this.type === "active" ? projectStatus.Active : projectStatus.Finished
    );
  }
  dragLeaveHandler(event: DragEvent): void {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  configure(): void {
    this.element.addEventListener("dragover", this.dragOverHandler.bind(this));
    this.element.addEventListener("drop", this.dropHandler.bind(this));
    this.element.addEventListener(
      "dragleave",
      this.dragLeaveHandler.bind(this)
    );

    projectState.addListerners((projects: Project[]) => {
      let filteredProjects = projects.filter((prj) => {
        if ("active" === this.type) {
          return prj.projectStatus === projectStatus.Active;
        }
        return prj.projectStatus === projectStatus.Finished;
      });

      this.assignedProjects = filteredProjects;
      this.renderProjects();
    });
  }
  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;

    listEl.innerHTML = "";

    for (const prj of this.assignedProjects) {
      new ProjectItem(this.element.querySelector("ul")!.id, prj);
    }

    // if (this.assignedProjects !== undefined) {
    //   new ProjectItem(
    //     this.element.querySelector("ul")!.id,
    //     this.assignedProjects
    //   );
    // }
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
