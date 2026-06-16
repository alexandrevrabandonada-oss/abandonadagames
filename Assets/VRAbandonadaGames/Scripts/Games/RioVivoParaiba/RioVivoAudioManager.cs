using UnityEngine;

namespace VRAbandonadaGames.Games.RioVivoParaiba
{
    public sealed class RioVivoAudioManager : MonoBehaviour
    {
        [SerializeField] private AudioSource ambienceSource;
        [SerializeField] private AudioSource effectsSource;
        [SerializeField] private AudioClip riverAmbienceClip;
        [SerializeField] private AudioClip urbanAmbienceClip;
        [SerializeField] private AudioClip collectClip;
        [SerializeField] private AudioClip recoveryClip;
        [SerializeField] private AudioClip victoryClip;

        private void Start()
        {
            PlayAmbience();
        }

        public void PlayCollect()
        {
            PlayOneShot(collectClip, 0.9f);
        }

        public void PlayRecovery()
        {
            PlayOneShot(recoveryClip, 1f);
        }

        public void PlayVictory()
        {
            PlayOneShot(victoryClip, 1f);
        }

        private void PlayAmbience()
        {
            if (ambienceSource == null)
            {
                return;
            }

            ambienceSource.loop = true;
            ambienceSource.volume = 0.32f;

            if (riverAmbienceClip != null)
            {
                ambienceSource.clip = riverAmbienceClip;
                ambienceSource.Play();
            }

            if (urbanAmbienceClip == null)
            {
                return;
            }

            var urbanSource = gameObject.AddComponent<AudioSource>();
            urbanSource.playOnAwake = true;
            urbanSource.loop = true;
            urbanSource.volume = 0.16f;
            urbanSource.clip = urbanAmbienceClip;
            urbanSource.Play();
        }

        private void PlayOneShot(AudioClip clip, float volume)
        {
            if (effectsSource == null || clip == null)
            {
                return;
            }

            effectsSource.PlayOneShot(clip, volume);
        }
    }
}
