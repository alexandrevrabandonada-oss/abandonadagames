using UnityEngine;

namespace VRAbandonadaGames.Games.RioVivoParaiba
{
    public sealed class RioVivoFeedbackFX : MonoBehaviour
    {
        [SerializeField] private float pulseDuration = 0.25f;
        [SerializeField] private float pulseScale = 1.2f;
        [SerializeField] private Color flashColor = new Color(0.7f, 1f, 0.7f, 1f);

        public void PlayPulse(Transform target)
        {
            if (target == null)
            {
                return;
            }

            StartCoroutine(PulseRoutine(target));
        }

        private System.Collections.IEnumerator PulseRoutine(Transform target)
        {
            var startScale = target.localScale;
            var renderer = target.GetComponentInChildren<Renderer>();
            var baseColor = renderer != null && renderer.material != null ? renderer.material.color : Color.white;
            var elapsed = 0f;

            while (elapsed < pulseDuration)
            {
                elapsed += Time.deltaTime;
                var t = elapsed / pulseDuration;
                var curve = 1f + (Mathf.Sin(t * Mathf.PI) * (pulseScale - 1f));
                target.localScale = startScale * curve;
                if (renderer != null && renderer.material != null)
                {
                    renderer.material.color = Color.Lerp(baseColor, flashColor, Mathf.Sin(t * Mathf.PI));
                }

                yield return null;
            }

            target.localScale = startScale;
            if (renderer != null && renderer.material != null)
            {
                renderer.material.color = baseColor;
            }
        }
    }
}
