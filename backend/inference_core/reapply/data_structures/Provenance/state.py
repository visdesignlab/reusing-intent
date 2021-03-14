from backend.inference_core.reapply.data_structures.base_interaction import (
    GenericInteraction,
)


class State(object):
    def __init__(self, interaction):
        self.interaction = GenericInteraction(interaction)
