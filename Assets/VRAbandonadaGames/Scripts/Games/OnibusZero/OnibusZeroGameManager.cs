using UnityEngine;

namespace VRAbandonadaGames.Games.OnibusZero
{
    public sealed class OnibusZeroGameManager : MonoBehaviour
    {
        [SerializeField] private float matchDuration = 90f;
        [SerializeField] private float startingFare = 5f;
        [SerializeField] private float minimumFare = 0f;
        [SerializeField] private OnibusZeroHUD hud;
        [SerializeField] private OnibusZeroResultPanel resultPanel;

        private float timeRemaining;
        private float currentFare;
        private int passengersCollected;
        private int districtsConnected;
        private int supportPoints;
        private int combo;
        private int maxCombo;
        private bool matchEnded;

        public float TimeRemaining => timeRemaining;
        public float CurrentFare => currentFare;
        public int PassengersCollected => passengersCollected;
        public int DistrictsConnected => districtsConnected;
        public int SupportPoints => supportPoints;
        public int Combo => combo;
        public int MaxCombo => maxCombo;
        public float SupportNormalized => Mathf.Clamp01(supportPoints / 100f);
        public bool IsMatchActive => !matchEnded;

        private void Start()
        {
            RestartMatch();
        }

        private void Update()
        {
            if (matchEnded)
            {
                return;
            }

            timeRemaining -= Time.deltaTime;
            if (timeRemaining <= 0f)
            {
                timeRemaining = 0f;
                EndMatch();
            }

            RefreshHud(string.Empty);
        }

        public void RestartMatch()
        {
            timeRemaining = matchDuration;
            currentFare = startingFare;
            passengersCollected = 0;
            districtsConnected = 0;
            supportPoints = 0;
            combo = 0;
            maxCombo = 0;
            matchEnded = false;

            if (resultPanel != null)
            {
                resultPanel.Hide();
            }

            foreach (var passenger in FindObjectsByType<OnibusZeroPassenger>(FindObjectsInactive.Include, FindObjectsSortMode.None))
            {
                passenger.ResetState();
            }

            foreach (var stop in FindObjectsByType<OnibusZeroPassengerStop>(FindObjectsInactive.Include, FindObjectsSortMode.None))
            {
                stop.ResetState();
            }

            foreach (var checkpoint in FindObjectsByType<OnibusZeroRouteCheckpoint>(FindObjectsInactive.Include, FindObjectsSortMode.None))
            {
                checkpoint.ResetState();
            }

            RefreshHud("Pegue passageiros e reduza a tarifa!");
        }

        public void RegisterPassengerPickup(int passengerCount)
        {
            if (matchEnded)
            {
                return;
            }

            passengersCollected += passengerCount;
            supportPoints += 5 * passengerCount;
            AdvanceCombo(1);
            RefreshHud(passengerCount > 1 ? "Linha cheia!" : "Passageiro a bordo!");
        }

        public void RegisterCheckpoint()
        {
            if (matchEnded)
            {
                return;
            }

            districtsConnected += 1;
            supportPoints += 8 + combo;
            currentFare = Mathf.Max(minimumFare, currentFare - (0.18f + (combo * 0.02f)));
            AdvanceCombo(1);
            RefreshHud("Tarifa caiu!");
        }

        public void RegisterNearMiss()
        {
            if (matchEnded)
            {
                return;
            }

            supportPoints += 1;
            AdvanceCombo(1);
            RefreshHud("Combo popular!");
        }

        public void RegisterObstacleHit()
        {
            if (matchEnded)
            {
                return;
            }

            combo = 0;
            supportPoints = Mathf.Max(0, supportPoints - 6);
            timeRemaining = Mathf.Max(0f, timeRemaining - 4f);
            RefreshHud("Cuidado com o buraco!");
        }

        public string GetRank()
        {
            if (supportPoints >= 85 && currentFare <= 0.5f)
            {
                return "S";
            }

            if (supportPoints >= 65 && currentFare <= 1.5f)
            {
                return "A";
            }

            if (supportPoints >= 45)
            {
                return "B";
            }

            if (supportPoints >= 25)
            {
                return "C";
            }

            return "D";
        }

        public string GetRankDescription()
        {
            return GetRank() switch
            {
                "S" => "Onibus Zero em movimento",
                "A" => "Tarifa popular",
                "B" => "Cidade conectada",
                "C" => "Rota funcionando",
                _ => "Linha quase parou"
            };
        }

        public string BuildShareText()
        {
            return "Joguei Corrida do Onibus Zero: transportei "
                + passengersCollected
                + " pessoas, conectei "
                + districtsConnected
                + " bairros e deixei a tarifa em R$ "
                + currentFare.ToString("0.00")
                + ". Meu rank foi "
                + GetRank()
                + ".";
        }

        private void EndMatch()
        {
            matchEnded = true;
            RefreshHud("Fim da linha!");
            if (resultPanel != null)
            {
                resultPanel.Show(this);
            }
        }

        private void AdvanceCombo(int amount)
        {
            combo += amount;
            if (combo > maxCombo)
            {
                maxCombo = combo;
            }
        }

        private void RefreshHud(string message)
        {
            if (hud != null)
            {
                hud.Refresh(this, message);
            }
        }
    }
}
