from backend.inference_core.reapply.data_structures.base_interaction import (
    BaseInteraction,
)


class FilterInteraction(BaseInteraction):
    def __init__(self, type, filterType, **kwargs):
        super().__init__(type)
        self.filterType = filterType
