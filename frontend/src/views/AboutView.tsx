import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  title: {
    marginBottom: "20px",
    textAlign: "center",
  },
});

const AboutView = () => {
  const classes = useStyles();
  return (
    <>
      <h3 className={classes.title}>What is this?</h3>
      <p>
        <b>LektProjekt</b> is a project to address a lot of the frustrations one
        of our felt with software help language learning. We want to provide an
        approach that cuts out the <i>bullshit</i> from the process.
      </p>
      <p>
        We have amassed a large database of examples from a number of languages,
        with an initial focus on <b>English/Spanish</b>. Using articial
        intelligence, we're able to identify many characteristics of these
        phrases.
      </p>
      <p>
        Using our data, you will be able to practice whatever gives you trouble
        in the language: <b>vocabulary </b>, <b>tenses</b>, <b>cases</b>,{" "}
        <b>moods</b>,<b>expressions</b>, and have your progress be tracked by a
        spaced repetition system.
      </p>
      <p>
        In the near future, we'll be hooking a lot of this up. Keep your eye on
        this domain
      </p>
    </>
  );
};

export default AboutView;
