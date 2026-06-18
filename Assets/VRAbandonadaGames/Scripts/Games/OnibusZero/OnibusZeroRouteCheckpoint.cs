using UnityEngine;

namespace VRAbandonadaGames.Games.OnibusZero
{
    [RequireComponent(typeof(Collider))]
    public sealed class OnibusZeroRouteCheckpoint : MonoBehaviour
    {
        [SerializeField] private OnibusZeroGameManager gameManager;
        [SerializeField] private MeshRenderer markerRenderer;

        private bool triggered;

        private void OnTriggerEnter(Collider other)
        {
            if (triggered)
            {
                return;
            }

            if (other.GetComponentInParent<OnibusZeroBusController>() == null)
            {
                return;
            }

            triggered = true;
            if (markerRenderer != null && markerRenderer.sharedMaterial.HasProperty("_Color"))
            {
                markerRenderer.sharedMaterial.color = new Color(0.22f, 0.9f, 0.42f, 1f);
            }

            gameManager?.RegisterCheckpoint();
        }

        public void ResetState()
        {
            triggered = false;
            if (markerRenderer != null && markerRenderer.sharedMaterial.HasProperty("_Color"))
            {
                markerRenderer.sharedMaterial.color = new Color(0.98f, 0.82f, 0.18f, 1f);
            }
        }
    }
}
