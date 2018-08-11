export function getEmbededUrl(link) {
  let url = new URL(link);

  if (link.includes('www.youtube.com/watch') || link.includes('www.youtube.com/playlist')) {
    let videoId = url.searchParams.get('v');
    let playlistId = url.searchParams.get('list');

    if (playlistId) {
      return `https://www.youtube.com/embed/videoseries?list=${playlistId}&fs=0`;
    } else if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?fs=0`;
    } else return link;

  } else if (link.includes('vimeo.com')) {
    let videoId = url.pathname.replace('/', '');
    return `https://player.vimeo.com/video/${videoId}`;
  } else if (link.includes('www.twitch.tv')) {
    let videoId = url.pathname.replace('/', '');
    return `https://player.twitch.tv/?volume=0.5&!muted&channel=${videoId}`;
  }

  return link;
}

export function isMediaLink(link) {
  if (link.includes('www.youtube.com/watch') && !link.includes('www.youtube.com/embed/')) {
    return true;
  } else if (link.includes('vimeo.com')) {
    return true;
  } else if (link.includes('www.twitch.tv')) {
    return true;
  } else if (link.includes('www.netflix.com')) {
    return true;
  } else return false;
}
