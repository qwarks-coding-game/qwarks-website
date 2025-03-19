export default function About() {
  return (
    <div>
      <h1>
        Installing QWARKS
      </h1>
      <h2>Download ZIP</h2>
      <p>Download the file from below that matches your operating system by clicking on the button.</p>
      <div>
        <button>
          <a href="https://qwarks-releases.s3.us-east-1.amazonaws.com/releases/newest/dist-Windows.zip">Windows</a>
        </button>
        <button>
          <a href="https://qwarks-releases.s3.us-east-1.amazonaws.com/releases/newest/dist-macOS.zip">MacOS</a>
        </button>
        <button>
          <a href="https://qwarks-releases.s3.us-east-1.amazonaws.com/releases/newest/dist-Linux.zip">Linux</a>
        </button>
      </div>

      <h2>Extract the ZIP file</h2>
      <p>Open the file in a file manager (File Explorer, Finder, etc).</p>
      <p>Right click on the file and select "Extract All" or "Unzip".</p>
      <p>Choose a location to extract the files to.</p>
      <br/>
      <p>Once the files are extracted, open up the extracted folder.</p>

      <h2>Locate the Executable</h2>
      <p>Inside of the folder, there may be another folder, called <i>dist</i>. Open up this folder.</p>
      <p>Located a file named <i>QWARKSWindows.exe</i>, <i>QWARKSDarwin</i>, or <i>QWARKSLinux</i>. Double click on that file. You may need to follow OS-specific instructions below.</p>
      <br/>
      <h3>If you are on Windows</h3>
      <ol style={{display: "flex", alignItems: "center", flexDirection: "column", textAlign: "center"}}>
        <li>If Microsoft Defender pops up, click on More Info and press the Run Anyway button.</li>
      </ol>
      <br/>
      <h3>If you are on MacOS</h3>
      <ol style={{display: "flex", alignItems: "center", flexDirection: "column", textAlign: "center"}}>
        <li>Open up a terminal in the same folder as the executable. Type <i>ls</i> and hit enter to make sure that you are in the right folder.</li>
        <li>Type in <i>chmod +x QWARKS</i> and hit enter. You may need to run <i>sudo chmod +x QWARKS</i>.</li>
        <li>Go back to Finder and double click on the file again. If this doesn't work, try running <i>./QWARKSDarwin</i> or <i>sudo ./QWARKSDarwin</i> in the terminal.</li>
        <li>If MacOS says that there are permission issues, go to Apple menu > System Settings, then click Privacy & Security in the sidebar. (You may need to scroll down.) </li>
        <li>Go to Security, locate the warning about QWARKSDarwin, then click Open. </li>
        <li>Click Open Anyway. (This button is available for about an hour after you try to open the app.)</li>
        <li>Enter your login password, then click OK.</li>
        <li>If it doesn’t run, you may need to double click on the file again.</li>
      </ol>

      <h2>Run a game</h2>
      <p><i>Before following the instructions below, note that you can click on the window a couple times and hit the Q key to exit the window</i></p>
      
      <p>If your installation is successful, you should see a terminal asking you for a player name. Enter <i>exampleplayer</i> and hit enter twice.</p>
      <p>You should see a window pop up with some square and circles. If you see this, congratulations! You've successfully installed QWARKs. We're working on a quickstart manual.</p>
    </div>
  );
}
