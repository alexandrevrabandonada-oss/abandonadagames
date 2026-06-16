using UnityEngine;

namespace VRAbandonadaGames.Games.RioVivoParaiba
{
    public sealed class RioVivoInteractionHighlighter : MonoBehaviour
    {
        [SerializeField] private Renderer[] targetRenderers;
        [SerializeField] private Color highlightColor = new Color(1f, 0.95f, 0.55f, 1f);
        [SerializeField] private GameObject indicator;

        private Color[] baseColors = new Color[0];
        private bool initialized;

        private void Awake()
        {
            if (targetRenderers == null || targetRenderers.Length == 0)
            {
                targetRenderers = GetComponentsInChildren<Renderer>(true);
            }

            baseColors = new Color[targetRenderers.Length];
            for (var index = 0; index < targetRenderers.Length; index++)
            {
                var renderer = targetRenderers[index];
                if (renderer != null && renderer.material != null)
                {
                    baseColors[index] = renderer.material.color;
                }
            }

            SetHighlighted(false);
            initialized = true;
        }

        public void SetHighlighted(bool highlighted)
        {
            if (!initialized && indicator != null)
            {
                indicator.SetActive(highlighted);
            }

            for (var index = 0; index < targetRenderers.Length; index++)
            {
                var renderer = targetRenderers[index];
                if (renderer == null || renderer.material == null)
                {
                    continue;
                }

                renderer.material.color = highlighted
                    ? Color.Lerp(baseColors[index], highlightColor, 0.4f)
                    : baseColors[index];
            }

            if (indicator != null)
            {
                indicator.SetActive(highlighted);
            }
        }
    }
}
