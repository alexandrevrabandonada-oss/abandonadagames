using UnityEngine;
using UnityEngine.UI;

namespace VRAbandonadaGames.Games.OnibusZero
{
    public sealed class OnibusZeroHUD : MonoBehaviour
    {
        [SerializeField] private Text timerText;
        [SerializeField] private Text passengersText;
        [SerializeField] private Text fareText;
        [SerializeField] private Text supportText;
        [SerializeField] private Text comboText;
        [SerializeField] private Text objectiveText;
        [SerializeField] private Text quickMessageText;
        [SerializeField] private Image supportFill;

        public void Refresh(OnibusZeroGameManager gameManager, string quickMessage)
        {
            if (gameManager == null)
            {
                return;
            }

            if (timerText != null)
            {
                timerText.text = "Tempo: " + Mathf.CeilToInt(gameManager.TimeRemaining) + "s";
            }

            if (passengersText != null)
            {
                passengersText.text = "Passageiros: " + gameManager.PassengersCollected;
            }

            if (fareText != null)
            {
                fareText.text = "Tarifa: R$ " + gameManager.CurrentFare.ToString("0.00");
            }

            if (supportText != null)
            {
                supportText.text = "Apoio: " + gameManager.SupportPoints;
            }

            if (comboText != null)
            {
                comboText.text = "Combo: x" + Mathf.Max(1, gameManager.Combo);
            }

            if (objectiveText != null)
            {
                objectiveText.text = "Pegue passageiros e reduza a tarifa!";
            }

            if (quickMessageText != null && !string.IsNullOrEmpty(quickMessage))
            {
                quickMessageText.text = quickMessage;
            }

            if (supportFill != null)
            {
                supportFill.fillAmount = gameManager.SupportNormalized;
            }
        }
    }
}
