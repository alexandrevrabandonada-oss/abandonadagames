using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace VRAbandonadaGames.Games.OnibusZero
{
    public sealed class OnibusZeroResultPanel : MonoBehaviour
    {
        private const string HubSceneName = "VRA_Games_PrototypeHub";

        [SerializeField] private GameObject panelRoot;
        [SerializeField] private Text titleText;
        [SerializeField] private Text statsText;
        [SerializeField] private Text shareText;

        public void Hide()
        {
            if (panelRoot != null)
            {
                panelRoot.SetActive(false);
            }
        }

        public void Show(OnibusZeroGameManager gameManager)
        {
            if (panelRoot != null)
            {
                panelRoot.SetActive(true);
            }

            if (titleText != null)
            {
                titleText.text = gameManager.GetRank() + " - " + gameManager.GetRankDescription();
            }

            if (statsText != null)
            {
                statsText.text =
                    "Passageiros: " + gameManager.PassengersCollected
                    + "\nBairros conectados: " + gameManager.DistrictsConnected
                    + "\nTarifa final: R$ " + gameManager.CurrentFare.ToString("0.00")
                    + "\nApoio popular: " + gameManager.SupportPoints
                    + "\nCombo maximo: x" + Mathf.Max(1, gameManager.MaxCombo);
            }

            if (shareText != null)
            {
                shareText.text = gameManager.BuildShareText();
            }
        }

        public void RestartGame()
        {
            SceneManager.LoadScene(SceneManager.GetActiveScene().name);
        }

        public void ReturnToHub()
        {
            SceneManager.LoadScene(HubSceneName);
        }
    }
}
