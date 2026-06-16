using UnityEngine;

namespace VRAbandonadaGames.Games.RioVivoParaiba
{
    public sealed class RioVivoTrashItem : RioVivoInteractable
    {
        [SerializeField] private int riverHealthGain = 5;
        [SerializeField] private GameObject collectedVisual;
        [SerializeField] private RioVivoFeedbackFX feedbackFx;

        private bool collected;

        public bool IsCollected => collected;

        public override bool CanInteract(RioVivoGameManager gameManager)
        {
            return !collected && gameManager != null && gameManager.CurrentStage >= RioVivoGameStage.Care;
        }

        public override void Interact(RioVivoGameManager gameManager)
        {
            if (!CanInteract(gameManager))
            {
                return;
            }

            collected = true;
            if (collectedVisual != null)
            {
                collectedVisual.SetActive(false);
            }
            else
            {
                gameObject.SetActive(false);
            }

            if (feedbackFx != null)
            {
                feedbackFx.PlayPulse(transform);
            }

            gameManager.RegisterTrashCollected(riverHealthGain, gameObject.name);
        }
    }
}
