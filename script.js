const chat = document.getElementById("chat");
const entrada = document.getElementById("pergunta");
const botao = document.getElementById("botaoEnviar");

function adicionarMensagem(texto, classe) {
  const div = document.createElement("div");
  div.className = `mensagem ${classe}`;
  div.textContent = texto;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

async function enviarPergunta() {
  const pergunta = entrada.value.trim();
  if (!pergunta || botao.disabled) return;

  adicionarMensagem(pergunta, "usuario");
  entrada.value = "";
  botao.disabled = true;

  const mensagemIA = adicionarMensagem("Pensando... 🤔", "ia");

  try {
    const resposta = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pergunta })
    });

    if (!resposta.ok) throw new Error("Servidor retornou um erro.");

    const dados = await resposta.json();

    mensagemIA.textContent =
      `RESPOSTA\n${dados.resposta || "Sem resposta."}\n\nEXPLICAÇÃO\n${dados.explicacao || "Sem explicação."}`;
  } catch (erro) {
    console.error(erro);
    mensagemIA.textContent =
      "Não consegui conectar ao servidor. Verifique se o backend está ligado.";
  } finally {
    botao.disabled = false;
    entrada.focus();
    chat.scrollTop = chat.scrollHeight;
  }
}

document.getElementById("areaInput").addEventListener("submit", (event) => {
  event.preventDefault();
  enviarPergunta();
});
