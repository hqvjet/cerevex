from factories import invoke_ved_model, invoke_title_content_model
from schemas import PredictInput, PredictOutput
from constants import VED_MODEL, TITLE_CONTENT_MODEL


def routing(payload: PredictInput):
    if type(payload[0]) == tuple:
        return TITLE_CONTENT_MODEL
    return VED_MODEL

def invoke(payload: list):
    model_name = routing(payload)
    if model_name == VED_MODEL:
        predicted = invoke_ved_model(payload)
    else:
        predicted = invoke_title_content_model(payload)


    return predicted

