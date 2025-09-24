# UHH Intelligent Virtual Human SDK IVA-SERVER
The Service Connector enables the Intelligent Virtual Human SDK to reliably connect to various AI cloud services. 
It works together with:
-  ``intelligent-virtual-agent-sdk`` [unity package](https://github.com/uhhhci/intelligent-virtual-agent-sdk) 
- ``intelligent-virtual-agent-examples`` [unity example project](https://github.com/uhhhci/intelligent-virtual-agent-sdk-examples)


<span style="color:red"> ***Please note that the usage of the SDK requires ethical & responsible use. Details can be found [here](./LICENSE.md).***</span>


***For more detail on the ethical Issues of impersonation and AI fakes we refer to the following [paper](https://zenodo.org/records/15413114):*** 

Oliva, R., Wiesing, M., Gállego, J., Inami, M., Interrante, V., Lecuyer, A., McDonnell, R., Nouviale, F., Pan, X., Steinicke, F., & Slater, M. (2025). Where Extended Reality and AI May Take Us: Ethical Issues of Impersonation and AI Fakes in Social Virtual Reality (Version 1). Zenodo. 

## General Information

### Requirements
- Node.js
  - Recommended Node version: `20.18.0`
  - Recommended npm version: `10.8.2`

- API keys for the used services
    - OpenAI API (TTS, LLM)
    - Google Cloud API (STT)

### Maintainer
Name: Sebastian Rings, Ke Li <br>
E-Mail: sebastian.rings@uni-hamburg.de, ke.li@uni-hamburg.de

## Getting Started
1. If missing, install Node.js and make sure it has been added to the PATH variable.
        - Download from [nodejs.org](https://nodejs.org/en/download/).
        - Use a package manager like [Chocolatey](https://chocolatey.org/) or [Node Version Manager (NVM)](https://github.com/coreybutler/nvm-windows#installation--upgrades).

    Verify the installation by running `node -v` and `npm -v` in a terminal and compare the installed with recommended versions.

3. Clone the ServiceConnector repository to the desired location by executing: `git clone https://github.com/uhhhci/iva-server` in a terminal or using your favorite Git tool. You can alternatively download the .zip file and extract it from there.

4. Set Up Environment Variables
    - In the root directory of the cloned repository, create a folder named `.env`.
    - Inside this folder, create a file named `.env`.

    Add your API keys to the .env file as follows:
    - OpenAI API Key:
        - Add the following line to the `.env` file:

            `OPENAI_API_KEY=your_openai_api_key`

    - Server API key
        - Add the following line to the `.env` file:

            `API_KEY=your_server_api_key`

    - Google Cloud API:
        - Place your `service-account.json` file inside the `.env` folder.
        - Add the following line to the `.env` file:

            `GOOGLE_APPLICATION_CREDENTIALS=./.env/service-account.json`

    - Additional lines to add to the .env file
        - Add the following lines to the `.env` file:

            `USE_DATABASE=FALSE`

            `PG_USER=`

            `PG_PASSWORD=`

            `PG_DATABASE=`

            `PG_HOST=`
            
            `PG_PORT=`

            
    For more details on obtaining API keys, refer to the [documentation](https://git.informatik.uni-hamburg.de/presence/WP4/intelligent-virtual-humans-sdk/documentation#getting-api-keys-for-cloud-services).

6. Open the root directory of the cloned ServiceConnector repository in a terminal and install the required packages/dependencies by executing `npm install` in the terminal.

7. Run the ServiceConnector application by executing `node server.js` located in the root directory of the repository.


### LICENSE 
This toolkit is released for academic and research purposes only, free of charge. For commercial use, a seperate license must be obtained.  Please find detailed licensing information [here](./LICENSE.md)

### Citation
If this work helps your research, please consider citing the following papers:

```
@article{Mostajeran2025ATF,
  title={A Toolkit for Creating Intelligent Virtual Humans in Extended Reality},
  author={Fariba Mostajeran and Ke Li and Sebastian Rings and Lucie Kruse and Erik Wolf and Susanne Schmidt and Michael Arz and Joan Llobera and Pierre Nagorny and Caecilia Charbonnier and Hannes Fassold and Xenxo Alvarez and Andr{\'e} Tavares and Nuno Santos and Jo{\~a}o Orvalho and Sergi Fern{\'a}ndez and Frank Steinicke},
  journal={2025 IEEE Conference on Virtual Reality and 3D User Interfaces Abstracts and Workshops (VRW)},
  year={2025},
  pages={736-741},
  url={https://api.semanticscholar.org/CorpusID:278065150}
}

@article{Li2025IHS,
  title={I Hear, See, Speak \& Do: Bringing Multimodal Information Processing to Intelligent Virtual Agents for Natural Human-AI Communication},
  author={Ke Li and Fariba Mostajeran and Sebastian Rings and Lucie Kruse and Susanne Schmidt and Michael Arz and Erik Wolf and Frank Steinicke},
  journal={2025 IEEE Conference on Virtual Reality and 3D User Interfaces Abstracts and Workshops (VRW)},
  year={2025},
  pages={1648-1649},
  url={https://api.semanticscholar.org/CorpusID:278063630}
}
```



## Acknowledgement 

This work has received funding from the European Union’s Horizon Europe research and innovation program under grant agreement No 101135025, PRESENCE project. 