using UnityEngine;

namespace VRAbandonadaGames.Social
{
    public sealed class SocialShareResultSystem : MonoBehaviour
    {
        [SerializeField] private string resultTitle = "Resultado do prototipo";
        [SerializeField] private int score;
        [SerializeField] [TextArea(2, 4)] private string educationalPhrase;
        [SerializeField] [TextArea(2, 4)] private string callToAction;

        public string BuildShareText()
        {
            return resultTitle + "\n"
                + "Pontuacao: " + score + "\n"
                + educationalPhrase + "\n"
                + callToAction;
        }

        public void CopyShareText()
        {
            GUIUtility.systemCopyBuffer = BuildShareText();
            Debug.Log("VR Abandonada Games: texto de compartilhamento copiado.");
        }

        public void RequestCardGeneration()
        {
            Debug.Log("VR Abandonada Games: geracao de card sera integrada em um proximo tijolo.");
        }
    }
}
