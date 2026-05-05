/* Textos estáticos del sitio público. Editar aquí para actualizar contenido. */

export const ABOUT = {
  eyebrow: 'Sobre Nosotros',
  heading: 'Cuidado clínico con enfoque humano.',
  bio: [
    'Soy Licenciada en Kinesiología y Fisiatría (UBA), con más de 10 años de experiencia clínica en Buenos Aires. Mi práctica integra evidencia científica actualizada con una atención cercana y personalizada.',
    'Trabajo con pacientes de todas las edades: desde deportistas de alto rendimiento hasta personas en rehabilitación post-quirúrgica o recuperación neurológica. Cada plan de tratamiento es único.',
  ],
  credentials: [
    { label: 'Licenciada en Kinesiología y Fisiatría', institution: 'Universidad de Buenos Aires (UBA)' },
    { label: 'Especialización en Kinesiología Deportiva', institution: 'INEF — Buenos Aires' },
    { label: 'Posgrado en Neurorehabilitación', institution: 'Fundación Favaloro' },
    { label: 'Matrícula profesional N.° KIN-4821', institution: 'Ministerio de Salud CABA' },
  ],
  stats: [
    { value: '+10', label: 'años de experiencia' },
    { value: '+600', label: 'pacientes tratados' },
    { value: '3', label: 'especialidades' },
  ],
}

export const TESTIMONIALS = [
  {
    id: '1',
    quote:
      'Llegué con una hernia de disco que me impedía trabajar. Después de 8 sesiones pude retomar mis actividades sin dolor. El enfoque personalizado marcó la diferencia.',
    author: 'Marcelo R.',
    treatment: 'Rehabilitación lumbar',
    rating: 5,
  },
  {
    id: '2',
    quote:
      'Tuve una rotura de ligamento cruzado y la kinesiología post-operatoria fue fundamental. Volví a correr en tiempo récord gracias al plan de ejercicios que me dieron.',
    author: 'Valentina S.',
    treatment: 'Kinesiología deportiva',
    rating: 5,
  },
  {
    id: '3',
    quote:
      'Mi mamá tuvo un ACV y el trabajo neurológico fue muy paciente y progresivo. Hoy camina sola. No tengo palabras para agradecer la dedicación del consultorio.',
    author: 'Familia González',
    treatment: 'Neurorehabilitación',
    rating: 5,
  },
  {
    id: '4',
    quote:
      'Cervicalgia crónica de años. Con 6 semanas de tratamiento combinado desaparecieron las contracturas y el dolor de cabeza asociado. Excelente profesional.',
    author: 'Patricia M.',
    treatment: 'Columna cervical',
    rating: 5,
  },
]

export const FAQ: { question: string; answer: string }[] = [
  {
    question: '¿Necesito derivación médica para sacar un turno?',
    answer:
      'No es obligatoria para la primera consulta. Sin embargo, si contás con estudios (radiografías, RMN, ecografías) o una orden de tu médico tratante, traelos — nos ayudan a diseñar el plan de rehabilitación más preciso desde el inicio.',
  },
  {
    question: '¿Cuántas sesiones voy a necesitar?',
    answer:
      'Depende de cada diagnóstico y condición. En la primera consulta realizamos una evaluación completa y te explicamos el plan estimado. La mayoría de los tratamientos agudos (esguinces, contracturas) requieren entre 4 y 10 sesiones; las rehabilitaciones post-quirúrgicas o neurológicas pueden extenderse varios meses.',
  },
  {
    question: '¿Qué debo llevar a la primera consulta?',
    answer:
      'DNI, estudios médicos previos relacionados con tu problema (si los tenés), ropa cómoda que permita acceder a la zona afectada, y la lista de medicamentos que tomás actualmente. Si tenés cobertura médica, llevá el carnet de tu obra social o prepaga.',
  },
  {
    question: '¿Trabajan con obras sociales y prepagas?',
    answer:
      'Sí. Trabajamos con las principales coberturas médicas. Te recomendamos consultar con tu obra social o prepaga antes de la sesión sobre los requisitos de reintegro, ya que los procedimientos varían según el plan.',
  },
  {
    question: '¿Con cuánta anticipación puedo cancelar un turno?',
    answer:
      'Te pedimos que canceles con al menos 24 horas de anticipación para poder reasignar el horario a otro paciente. Podés hacerlo desde el email de confirmación que recibís al reservar, o llamando directamente al consultorio.',
  },
  {
    question: '¿Las sesiones son individuales o grupales?',
    answer:
      'Todas las sesiones son individuales y se desarrollan en box privado. Creemos que la atención personalizada es fundamental para el progreso terapéutico: cada sesión se adapta a tu evolución del día.',
  },
  {
    question: '¿Hacen kinesiología a domicilio?',
    answer:
      'En casos puntuales de pacientes con movilidad muy reducida podemos evaluar la posibilidad. Consultá por WhatsApp para analizar tu situación.',
  },
]
