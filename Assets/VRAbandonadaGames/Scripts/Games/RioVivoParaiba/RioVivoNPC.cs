using UnityEngine;

namespace VRAbandonadaGames.Games.RioVivoParaiba
{
    public sealed class RioVivoNPC : RioVivoInteractable
    {
        [SerializeField] [TextArea(3, 6)] private string dialogueText =
            "O rio nao e deposito de lixo. Se a comunidade se organiza, a margem volta a respirar.";

        [SerializeField] private string speakerName = "Moradora";

        private bool hasSpoken;

        public bool HasSpoken => hasSpoken;

        public override bool CanInteract(RioVivoGameManager gameManager)
        {
            return gameManager != null;
        }

        public override void Interact(RioVivoGameManager gameManager)
        {
            if (gameManager == null)
            {
                return;
            }

            hasSpoken = true;
            gameManager.RegisterNpcConversation(speakerName, dialogueText);
        }
    }
}
