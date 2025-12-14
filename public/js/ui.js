/* =========================
   역할 관리
   ========================= */

function getRole() {
  return localStorage.getItem('role') || 'host';
}

function updatePasswordVisibility() {
  const role = getRole();
  const fields = document.querySelectorAll('.password-field');

  fields.forEach(field => {
    field.style.display = (role === 'host') ? 'none' : 'block';
  });
}

function setRole(role) {
  localStorage.setItem('role', role);
  updatePasswordVisibility();
}

/* 페이지 로드 시 역할 반영 */
document.addEventListener('DOMContentLoaded', () => {
  updatePasswordVisibility();

  const role = getRole();
  const radio = document.querySelector(
    `input[name="role"][value="${role}"]`
  );
  if (radio) radio.checked = true;
});

/* =========================
   게시글 / 댓글 폼 공통 처리
   ========================= */

function attachRole(form) {
  const role = getRole();
  form.role.value = role;

  if (role === 'client') {
    if (!form.password || !form.password.value) {
      alert('클라이언트는 비밀번호 입력이 필요합니다.\n ( 클라이언트는 호스트의 요소를 삭제할 수 없습니다. ) ');
      return false;
    }
  }

  if (role === 'host' && form.password) {
    form.password.value = '';
  }

  return true;
}


/* =========================
   UI 테스트 페이지 기능
   ========================= */

function showText() {
  document.getElementById('textResult').innerText =
    document.getElementById('textInput').value;
}

function showRadio() {
  const radios = document.getElementsByName('radioTest');
  let value = '';
  radios.forEach(r => {
    if (r.checked) value = r.value;
  });
  document.getElementById('radioResult').innerText = value;
}

function showSelect() {
  document.getElementById('selectResult').innerText =
    document.getElementById('selectBox').value;
}

function showTextarea() {
  document.getElementById('textareaResult').innerText =
    document.getElementById('textArea').value;
}
