using UnityEngine;

namespace VRAbandonadaGames.Games.RioVivoParaiba
{
    [RequireComponent(typeof(Renderer))]
    public sealed class RioVivoWaterAnimator : MonoBehaviour
    {
        [SerializeField] private Vector2 uvSpeed = new Vector2(0.02f, 0.01f);
        [SerializeField] private float pulseAmplitude = 0.08f;
        [SerializeField] private float pulseSpeed = 0.8f;

        private Material runtimeMaterial;
        private Color baseColor;

        private void Awake()
        {
            var renderer = GetComponent<Renderer>();
            runtimeMaterial = renderer.material;
            baseColor = runtimeMaterial.color;
        }

        private void Update()
        {
            if (runtimeMaterial == null)
            {
                return;
            }

            runtimeMaterial.mainTextureOffset += uvSpeed * Time.deltaTime;
            var pulse = 1f + (Mathf.Sin(Time.time * pulseSpeed) * pulseAmplitude);
            runtimeMaterial.color = new Color(
                Mathf.Clamp01(baseColor.r * pulse),
                Mathf.Clamp01(baseColor.g * pulse),
                Mathf.Clamp01(baseColor.b * pulse),
                baseColor.a);
        }
    }
}
