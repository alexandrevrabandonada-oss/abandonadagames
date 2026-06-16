using System.Collections.Generic;
using UnityEngine;

namespace VRAbandonadaGames.Games.RioVivoParaiba
{
    public enum RioVivoGameStage
    {
        Diagnose,
        Care,
        Organize,
        Victory
    }

    public sealed class RioVivoGameManager : MonoBehaviour
    {
        [SerializeField] private RioVivoHUD hud;
        [SerializeField] private RioVivoResultPanel resultPanel;
        [SerializeField] private RioVivoAudioManager audioManager;
        [SerializeField] private int initialRiverHealth = 30;
        [SerializeField] private int requiredTrashCount = 8;
        [SerializeField] private int requiredRecoveryPoints = 3;
        [SerializeField] private int requiredRiverHealth = 80;

        private readonly HashSet<string> collectedTrashIds = new HashSet<string>();
        private readonly HashSet<RioVivoRecoveryType> recoveredTypes = new HashSet<RioVivoRecoveryType>();

        public RioVivoGameStage CurrentStage { get; private set; }
        public int TrashCollected => collectedTrashIds.Count;
        public int RecoveryPointsActivated => recoveredTypes.Count;
        public int RiverHealth { get; private set; }
        public int RequiredTrashCount => requiredTrashCount;
        public int RequiredRecoveryPoints => requiredRecoveryPoints;
        public int RequiredRiverHealth => requiredRiverHealth;
        public string CurrentObjective { get; private set; }

        private void Start()
        {
            RiverHealth = initialRiverHealth;
            CurrentStage = RioVivoGameStage.Diagnose;
            CurrentObjective = "Converse com a moradora para diagnosticar os problemas da margem.";
            if (resultPanel != null)
            {
                resultPanel.Hide();
            }

            if (hud != null)
            {
                hud.HideDialogue();
                hud.UpdateGameState(this);
                hud.ShowMessage("Use WASD ou setas para andar. Pressione E para interagir.", 4f);
            }
        }

        public void RegisterNpcConversation(string speakerName, string dialogueText)
        {
            if (hud != null)
            {
                hud.ShowDialogue(speakerName, dialogueText);
                hud.ShowMessage("Agora recolha pelo menos 8 residuos da margem.");
            }

            if (CurrentStage == RioVivoGameStage.Diagnose)
            {
                CurrentStage = RioVivoGameStage.Care;
                CurrentObjective = "Colete 8 residuos para melhorar a saude do rio.";
                RefreshHud();
            }
        }

        public void RegisterTrashCollected(int riverHealthGain, string trashId)
        {
            if (!collectedTrashIds.Add(trashId))
            {
                return;
            }

            RiverHealth = Mathf.Clamp(RiverHealth + riverHealthGain, 0, 100);
            if (hud != null)
            {
                hud.ShowMessage("Residuo recolhido. Cada cuidado fortalece o rio.");
            }

            if (audioManager != null)
            {
                audioManager.PlayCollect();
            }

            if (TrashCollected >= requiredTrashCount && CurrentStage == RioVivoGameStage.Care)
            {
                CurrentStage = RioVivoGameStage.Organize;
                CurrentObjective = "Ative 3 pontos de recuperacao comunitaria na margem.";
                if (hud != null)
                {
                    hud.ShowMessage("Etapa 2 concluida. Agora organize os pontos de recuperacao.");
                }
            }

            RefreshHud();
            TryCompleteGame();
        }

        public void RegisterRecoveryPoint(RioVivoRecoveryType recoveryType, int riverHealthGain)
        {
            if (!recoveredTypes.Add(recoveryType))
            {
                return;
            }

            RiverHealth = Mathf.Clamp(RiverHealth + riverHealthGain, 0, 100);
            CurrentObjective = "Ative os pontos restantes e fortaleça o cuidado coletivo.";
            if (hud != null)
            {
                hud.ShowMessage("Ponto de recuperacao ativado.");
            }

            if (audioManager != null)
            {
                audioManager.PlayRecovery();
            }

            RefreshHud();
            TryCompleteGame();
        }

        private void TryCompleteGame()
        {
            if (CurrentStage == RioVivoGameStage.Victory)
            {
                return;
            }

            if (TrashCollected < requiredTrashCount
                || RecoveryPointsActivated < requiredRecoveryPoints
                || RiverHealth < requiredRiverHealth)
            {
                return;
            }

            CurrentStage = RioVivoGameStage.Victory;
            CurrentObjective = "Margem recuperada. Compartilhe a mensagem e volte ao hub.";
            RefreshHud();

            if (hud != null)
            {
                hud.ShowMessage("Vitoria! O rio voltou a respirar com o cuidado coletivo.", 5f);
                hud.HideDialogue();
            }

            if (resultPanel != null)
            {
                resultPanel.Show(this);
            }

            if (audioManager != null)
            {
                audioManager.PlayVictory();
            }
        }

        private void RefreshHud()
        {
            if (hud != null)
            {
                hud.UpdateGameState(this);
            }
        }
    }
}
