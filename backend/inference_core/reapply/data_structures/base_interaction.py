from backend.inference_core.reapply.data_structures.types import InteractionType


class BaseInteraction(object):
    def __init__(self, type, **kwargs):
        self.type: InteractionType = InteractionType(type)


class GenericInteraction(BaseInteraction):
    def __init__(self, interaction):
        super().__init__(interaction["type"])


class RootInteraction(BaseInteraction):
    def __init__(self):
        self.type = InteractionType.ROOT
