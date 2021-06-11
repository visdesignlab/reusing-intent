from ...db.models.algorithm_outputs.outlier import DBScanOutlier, IsolationForestOutlier


def resolve_predictions(*_, record_id):
    try:
        print(record_id)
        dbscan_outlier_predictions = DBScanOutlier.query.filter_by(
            record_id=record_id
        ).all()

        isolation_forest_predictions = IsolationForestOutlier.query.filter_by(
            record_id=record_id
        ).all()

        predictions = [*dbscan_outlier_predictions, *isolation_forest_predictions]

        payload = {
            "success": True,
            "predictions": map(lambda x: x.to_dict(), predictions),
        }
    except Exception as err:
        payload = {"success": False, "errors": [str(err)]}
    return payload
