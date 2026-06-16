using UnityEngine;
using UnityEngine.UI;

namespace VRAbandonadaGames.Games.RioVivoParaiba
{
    public sealed class RioVivoHUD : MonoBehaviour
    {
        [SerializeField] private Text gameTitleText;
        [SerializeField] private Text trashCountText;
        [SerializeField] private Text recoveryCountText;
        [SerializeField] private Text riverHealthText;
        [SerializeField] private Text objectiveText;
        [SerializeField] private Text promptText;
        [SerializeField] private Text temporaryMessageText;
        [SerializeField] private GameObject dialoguePanel;
        [SerializeField] private Text dialogueSpeakerText;
        [SerializeField] private Text dialogueBodyText;

        private float messageUntilTime;

        private void Update()
        {
            if (temporaryMessageText == null)
            {
                return;
            }

            if (temporaryMessageText.gameObject.activeSelf && Time.unscaledTime > messageUntilTime)
            {
                temporaryMessageText.gameObject.SetActive(false);
            }
        }

        public void UpdateGameState(RioVivoGameManager gameManager)
        {
            if (gameTitleText != null)
            {
                gameTitleText.text = "Rio Vivo Paraiba";
            }

            if (trashCountText != null)
            {
                trashCountText.text = "Residuos: " + gameManager.TrashCollected + "/" + gameManager.RequiredTrashCount;
            }

            if (recoveryCountText != null)
            {
                recoveryCountText.text = "Pontos recuperados: " + gameManager.RecoveryPointsActivated + "/" + gameManager.RequiredRecoveryPoints;
            }

            if (riverHealthText != null)
            {
                riverHealthText.text = "Saude do rio: " + gameManager.RiverHealth + "%";
            }

            if (objectiveText != null)
            {
                objectiveText.text = "Objetivo: " + gameManager.CurrentObjective;
            }
        }

        public void SetPrompt(string prompt)
        {
            if (promptText != null)
            {
                promptText.text = prompt;
            }
        }

        public void ShowMessage(string message, float duration = 3f)
        {
            if (temporaryMessageText == null)
            {
                return;
            }

            temporaryMessageText.text = message;
            temporaryMessageText.gameObject.SetActive(true);
            messageUntilTime = Time.unscaledTime + duration;
        }

        public void ShowDialogue(string speaker, string body)
        {
            if (dialoguePanel == null)
            {
                return;
            }

            dialoguePanel.SetActive(true);
            if (dialogueSpeakerText != null)
            {
                dialogueSpeakerText.text = speaker;
            }

            if (dialogueBodyText != null)
            {
                dialogueBodyText.text = body;
            }
        }

        public void HideDialogue()
        {
            if (dialoguePanel != null)
            {
                dialoguePanel.SetActive(false);
            }
        }
    }
}
