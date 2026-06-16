using System.Collections.Generic;
using UnityEngine;

namespace VRAbandonadaGames.Runtime
{
    public sealed class GameHubCore : MonoBehaviour
    {
        [SerializeField] private List<GameExperienceDefinition> experiences = new List<GameExperienceDefinition>();

        public IReadOnlyList<GameExperienceDefinition> Experiences => experiences;

        public void Register(GameExperienceDefinition definition)
        {
            if (definition == null || experiences.Contains(definition))
            {
                return;
            }

            experiences.Add(definition);
        }

        public GameExperienceDefinition FindByName(string experienceName)
        {
            return experiences.Find(item => item != null && item.experienceName == experienceName);
        }
    }
}
