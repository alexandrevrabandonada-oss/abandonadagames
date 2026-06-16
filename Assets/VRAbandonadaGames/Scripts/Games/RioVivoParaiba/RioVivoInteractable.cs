using UnityEngine;

namespace VRAbandonadaGames.Games.RioVivoParaiba
{
    public abstract class RioVivoInteractable : MonoBehaviour
    {
        [SerializeField] private string interactionLabel = "Interagir";
        [SerializeField] private RioVivoInteractionHighlighter highlighter;

        public string InteractionLabel => interactionLabel;

        public abstract bool CanInteract(RioVivoGameManager gameManager);
        public abstract void Interact(RioVivoGameManager gameManager);

        public virtual void SetHighlighted(bool highlighted)
        {
            if (highlighter != null)
            {
                highlighter.SetHighlighted(highlighted);
            }
        }
    }
}
