using UnityEngine;

namespace VRAbandonadaGames.Games.RioVivoParaiba
{
    public abstract class RioVivoInteractable : MonoBehaviour
    {
        [SerializeField] private string interactionLabel = "Interagir";

        public string InteractionLabel => interactionLabel;

        public abstract bool CanInteract(RioVivoGameManager gameManager);
        public abstract void Interact(RioVivoGameManager gameManager);
    }
}
