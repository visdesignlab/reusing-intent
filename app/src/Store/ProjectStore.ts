import { isChildNode } from '@visdesignlab/trrack';
import Axios, { AxiosResponse } from 'axios';
import { action, makeAutoObservable, reaction } from 'mobx';

import { SERVER } from '../consts';
import { OriginMap } from '../trrack-vis/Utils/BundleMap';
import deepCopy from '../Utils/DeepCopy';

import { Source } from './../trrack-vis/Utils/BundleMap';
import { ExploreStore } from './ExploreStore';
import { RootStore } from './Store';
import { Dataset } from './Types/Dataset';
import { Project, ProjectList, UploadedDatasetList } from './Types/Project';

export class ProjectStore {
  rootStore: RootStore;
  currentProject: Project | null = null;
  projects: ProjectList = [];
  comparisonDatasetKey: string | null = null;
  loadedDataset: Dataset | null = null;
  workingDataset: Dataset | null = null;
  comparisonDataset: Dataset | null = null;
  currentDatasetKey: string | null = null;

  isReapplying = false;
  // nodeCreationMap: OriginMap;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.loadProjects();

    reaction(
      () => this.currentDatasetKey,
      () => this.fetchCurrentDataset(),
    );
  }

  // ##################################################################### //
  // ############################## Getters ############################## //
  // ##################################################################### //

  get provenance() {
    return this.rootStore.provenance;
  }

  get loadedDatasetKey() {
    return this.currentDatasetKey || '';
  }

  get nodeCreationMap(): OriginMap {
    const originMap: OriginMap = {};

    Object.values(this.provenance.graph.nodes).forEach((node) => {
      const art = this.provenance.getLatestArtifact(node.id);

      if (!art) return;

      const { artifact } = art;

      const { original_dataset } = artifact;

      const datasetKey = this.versionFromDatasetKey(original_dataset);

      const source: Source = {
        createdIn: datasetKey,
        approvedIn: Object.entries(artifact.status_record)
          .filter((v) => v[1] === 'Accepted')
          .map((v) => this.versionFromDatasetKey(v[0])),
        rejectedIn: Object.entries(artifact.status_record)
          .filter((v) => v[1] === 'Rejected')
          .map((v) => this.versionFromDatasetKey(v[0])),
      };

      source.approvedIn.push(source.createdIn);

      originMap[node.id] = source;
    });

    return originMap;
  }

  get compDatasetValues() {
    return (
      this.comparisonDataset?.values.filter(
        (d) => !this.rootStore.compareStore.updatedFilterPoints.includes(d.id),
      ) || []
    );
  }

  // ##################################################################### //
  // ########################### Store Helpers ########################### //
  // ##################################################################### //

  versionFromDatasetKey = (key: string | null) => {
    let datasetVersion = '';

    if (this.currentProject && key) {
      const ds = this.currentProject.datasets.find((d) => d.key === key);

      if (ds) {
        datasetVersion = ds.version;
      }
    }

    return datasetVersion;
  };

  projectByKey = (key: string) => {
    const proj = this.projects.find((p) => p.key === key);

    return proj;
  };

  fetchCurrentDataset = () => {
    if (!this.currentProject || !this.currentDatasetKey) return;

    Axios.get(`${SERVER}/${this.currentProject.key}/dataset/${this.currentDatasetKey}`).then(
      action((response: AxiosResponse<Dataset>) => {
        this.loadedDataset = response.data;
        this.workingDataset = response.data;
      }),
    );
  };

  approveNode = (id: string) => {
    let { artifact = null } = this.provenance.getLatestArtifact(id) || {};

    if (artifact) {
      artifact = deepCopy(artifact);
      artifact.status_record[this.currentDatasetKey || ''] = 'Accepted';
      this.provenance.addArtifact(artifact, id);
    }
  };

  rejectNode = (id: string) => {
    let { artifact = null } = this.provenance.getLatestArtifact(id) || {};

    if (artifact) {
      artifact = deepCopy(artifact);
      artifact.status_record[this.currentDatasetKey || ''] = 'Rejected';
      this.provenance.addArtifact(artifact, id);
    }
  };

  // ##################################################################### //
  // ########################### Store Actions ########################### //
  // ##################################################################### //

  loadProjects = (newProjectId: string | null = null) => {
    Axios.get(`${SERVER}/project`).then(
      action((response: AxiosResponse<ProjectList>) => {
        this.projects = response.data;

        if (!newProjectId && this.rootStore.debug) {
          this.loadProjectByKey(this.rootStore.defaultProject);
        } else if (newProjectId) {
          const proj = this.projects.find((p) => p.key === newProjectId);

          if (proj) {
            this.loadProjectByKey(proj.key);
          }
        }
      }),
    );
  };

  loadProjectByKey = (projectId: string) => {
    const proj = this.projectByKey(projectId);

    if (!proj) return;

    this.loadedDataset = null;
    this.rootStore.exploreStore = new ExploreStore(this.rootStore);

    Axios.get(`${SERVER}/${projectId}/dataset`).then(
      action((response: AxiosResponse<UploadedDatasetList>) => {
        this.currentProject = { ...proj, datasets: response.data };

        if (this.rootStore.debug && this.rootStore.loadDefaultDataset) {
          const datasetKey = this.rootStore.defaultDatasetKey;

          if (datasetKey && this.currentProject.datasets.map((d) => d.key).includes(datasetKey))
            this.loadDataset(datasetKey);
          else this.loadDataset(this.currentProject.datasets[0].key);
        }
      }),
    );
  };

  loadComparisonDataset = (datasetKey: string) => {
    if (!this.currentProject) return;

    Axios.get(`${SERVER}/${this.currentProject.key}/dataset/${datasetKey}`).then(
      action((response: AxiosResponse<Dataset>) => {
        this.comparisonDatasetKey = datasetKey;
        this.comparisonDataset = response.data;
      }),
    );
  };

  // loadComparisonApply = (datasetKey: string) => {
  //   if (!this.currentProject) return;

  //   this.comparisonDatasetKey = datasetKey;

  //   Axios.get(`${SERVER}/${this.currentProject.key}/dataset/${datasetKey}`).then(
  //     action((response: AxiosResponse<Dataset>) => {
  //       this.comparisonDataset = response.data;
  //     }),
  //   );

  //   Axios.post(`${SERVER}/project/${this.currentProject.key}/apply`, {
  //     baseDataset: this.loadedDatasetKey,
  //     updatedDataset: datasetKey,
  //     interactions: this.rootStore.exploreStore.interactions || [],
  //   }).then(
  //     action((response: AxiosResponse<unknown>) => {
  //       this.rootStore.compareStore.updatedActions = response.data;
  //     }),
  //   );
  // };

  //load the dataset into comparison
  loadComparisonFilter = (selectedIds: string[]): string[] => {
    const removeIds = this.workingDataset?.values.filter((d) => {
      return selectedIds.includes(d.id);
    });

    const idList = [];

    if (this.workingDataset && removeIds) {
      this.workingDataset.values = removeIds;

      for (const j of removeIds) {
        idList.push(j.id);
      }
    }

    return idList;
  };

  loadOnlyFilter = (selectedIds: string[]): string[] => {
    const removeIds =
      this.workingDataset?.values.filter((d) => {
        return !selectedIds.includes(d.id);
      }) || [];

    const idList = [];

    if (this.workingDataset && removeIds) {
      this.workingDataset.values = removeIds;

      for (const j of removeIds) {
        idList.push(j.id);
      }
    }

    return idList;
  };

  // ##################################################################### //
  // ######################### Provenance Actions ######################## //
  // ##################################################################### //

  loadDataset = (datasetKey: string) => {
    this.currentDatasetKey = datasetKey;
  };

  loadDatasetWithReapply = (datasetKey: string) => {
    if (!this.currentProject || !this.currentDatasetKey) return;
    this.isReapplying = true;

    const graph = this.provenance.graph;

    Object.entries(graph.nodes).forEach((ent) => {
      const [key, val] = ent;

      if (isChildNode(val)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (val as any).state = this.provenance.getState(val);
      }

      graph.nodes[key] = val;
    });

    Axios.post(`${SERVER}/project/${this.currentProject.key}/reapply`, {
      base: this.currentDatasetKey,
      target: datasetKey,
      provenance: graph,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }).then(
      action((res) => {
        // this.provenance.importProvenanceGraph(res.data.graph);
        this.currentDatasetKey = datasetKey;
        this.rootStore.exploreStore.stateRecord = res.data;
        setTimeout(
          action(() => (this.isReapplying = false)),
          200,
        );
      }),
    );
  };
}
