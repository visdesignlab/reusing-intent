from backend.inference_core.reapply.data_structures.Provenance.state import State

NodeId = str


class Node(object):
    def __init__(
        self,
        id,
        label,
        metadata,
        state,
        children=[],
        parent=None,
        artifacts=None,
        **kwargs
    ):
        eventType = metadata["eventType"]
        self.id = id
        self.label = label
        self.eventType = eventType
        self.children = children
        self.parent = parent
        self._artifacts = artifacts
        self.state = State(**state)
        self.node = None

    def setNode(self, node):
        self.node = node

    @property
    def artifact(self):
        if self._artifacts is None or "customArtifacts" not in self._artifacts:
            return None
        arts = self._artifacts["customArtifacts"]

        if len(arts) == 0:
            return None

        art = arts[0]["artifact"]

        if "interaction" not in art:
            return None

        interaction = art["interaction"]

        return interaction

    def serialize(self):
        ser = self.node
        ser["state"] = self.state.__dict__
        return ser
