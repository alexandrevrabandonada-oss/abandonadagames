using UnityEngine;

namespace VRAbandonadaGames.Games.RioVivoParaiba
{
    public enum RioVivoRecoveryType
    {
        RiverbankPlanting,
        EducationalSign,
        CommunityCollectionPoint
    }

    public sealed class RioVivoRecoveryPoint : RioVivoInteractable
    {
        [SerializeField] private RioVivoRecoveryType recoveryType;
        [SerializeField] private int riverHealthGain = 15;
        [SerializeField] private GameObject inactiveVisual;
        [SerializeField] private GameObject activeVisual;

        private bool recovered;

        public RioVivoRecoveryType RecoveryType => recoveryType;
        public bool IsRecovered => recovered;

        public override bool CanInteract(RioVivoGameManager gameManager)
        {
            return !recovered
                && gameManager != null
                && gameManager.CurrentStage >= RioVivoGameStage.Organize
                && gameManager.TrashCollected >= gameManager.RequiredTrashCount;
        }

        public override void Interact(RioVivoGameManager gameManager)
        {
            if (!CanInteract(gameManager))
            {
                return;
            }

            recovered = true;
            if (inactiveVisual != null)
            {
                inactiveVisual.SetActive(false);
            }

            if (activeVisual != null)
            {
                activeVisual.SetActive(true);
            }

            gameManager.RegisterRecoveryPoint(recoveryType, riverHealthGain);
        }
    }
}
