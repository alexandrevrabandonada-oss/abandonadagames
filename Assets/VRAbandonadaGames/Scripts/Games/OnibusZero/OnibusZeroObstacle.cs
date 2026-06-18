using UnityEngine;

namespace VRAbandonadaGames.Games.OnibusZero
{
    public sealed class OnibusZeroObstacle : MonoBehaviour
    {
        [SerializeField] private Renderer feedbackRenderer;
        [SerializeField] private Color hitColor = new Color(1f, 0.35f, 0.2f, 1f);

        private Color originalColor;
        private float hitFlashTimer;

        private void Awake()
        {
            if (feedbackRenderer == null)
            {
                feedbackRenderer = GetComponentInChildren<Renderer>();
            }

            if (feedbackRenderer != null && feedbackRenderer.sharedMaterial != null && feedbackRenderer.sharedMaterial.HasProperty("_Color"))
            {
                originalColor = feedbackRenderer.sharedMaterial.color;
            }
        }

        private void Update()
        {
            if (feedbackRenderer == null || !feedbackRenderer.sharedMaterial.HasProperty("_Color"))
            {
                return;
            }

            if (hitFlashTimer > 0f)
            {
                hitFlashTimer -= Time.deltaTime;
                if (hitFlashTimer <= 0f)
                {
                    feedbackRenderer.sharedMaterial.color = originalColor;
                }
            }
        }

        public void Hit(OnibusZeroGameManager gameManager)
        {
            gameManager?.RegisterObstacleHit();
            if (feedbackRenderer != null && feedbackRenderer.sharedMaterial.HasProperty("_Color"))
            {
                feedbackRenderer.sharedMaterial.color = hitColor;
                hitFlashTimer = 0.25f;
            }
        }
    }
}
